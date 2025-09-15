from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from backend.db import get_db
from backend.models.user_model import User
from backend.models.withdrawal_model import Investment
from backend.models.associate_config_model import AssociateConfig
from utils.auth_middleware import verify_token

router = APIRouter(prefix="/associate", tags=["Associate"])


# ────────────────────────────────
# 📌 SCHEMAS
# ────────────────────────────────
from pydantic import BaseModel


class ConfigPayload(BaseModel):
    referral_percent: float
    lock_days: int


class ActionResponse(BaseModel):
    message: str
    amount: float | None = None
    new_investment_id: int | None = None
    wallet: str | None = None


# ────────────────────────────────
# 📌 ROUTES
# ────────────────────────────────

@router.get("/deposits")
def get_associate_deposits(db: Session = Depends(get_db), user=Depends(verify_token)):
    """List all deposits credited to associate."""
    deposits = (
        db.query(Investment)
        .filter(Investment.user_email == user.email, Investment.is_associate == True)
        .all()
    )

    result = []
    for dep in deposits:
        status = "Locked"
        if dep.matured_at and datetime.utcnow() >= dep.matured_at:
            status = "Matured"
        if dep.flushed:
            status = "Withdrawn"
        result.append({
            "id": dep.id,
            "amount": dep.amount,
            "timestamp": dep.timestamp,
            "source_investor": dep.source_investor,
            "lock_days": dep.lock_days,
            "matured_at": dep.matured_at,
            "roi_received": dep.roi_received,
            "status": status
        })
    return result


@router.post("/deposits/{deposit_id}/withdraw", response_model=ActionResponse)
def withdraw_associate_deposit(deposit_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    """Withdraw matured associate deposit + ROI."""
    dep = db.query(Investment).filter(
        Investment.id == deposit_id,
        Investment.user_email == user.email,
        Investment.is_associate == True
    ).first()

    if not dep:
        raise HTTPException(status_code=404, detail="Deposit not found")

    if not dep.matured_at or datetime.utcnow() < dep.matured_at:
        raise HTTPException(status_code=400, detail="Deposit not yet matured")

    if dep.flushed:
        raise HTTPException(status_code=400, detail="Already withdrawn or reinvested")

    payout_amount = dep.amount + dep.roi_received
    dep.flushed = True
    db.commit()

    # Here you’d trigger actual withdrawal logic (e.g., to TRC20 wallet)
    return ActionResponse(
        message="Deposit withdrawn successfully",
        amount=payout_amount,
        wallet=user.wallet if hasattr(user, "wallet") else None
    )


@router.post("/deposits/{deposit_id}/reinvest", response_model=ActionResponse)
def reinvest_associate_deposit(deposit_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    """Reinvest matured associate deposit into a new cycle."""
    dep = db.query(Investment).filter(
        Investment.id == deposit_id,
        Investment.user_email == user.email,
        Investment.is_associate == True
    ).first()

    if not dep:
        raise HTTPException(status_code=404, detail="Deposit not found")

    if not dep.matured_at or datetime.utcnow() < dep.matured_at:
        raise HTTPException(status_code=400, detail="Deposit not yet matured")

    if dep.flushed:
        raise HTTPException(status_code=400, detail="Already withdrawn or reinvested")

    reinvest_amount = dep.amount + dep.roi_received
    config = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()
    lock_days = config.lock_days if config else 30

    new_dep = Investment(
        user_email=user.email,
        amount=reinvest_amount,
        is_associate=True,
        source_investor=dep.source_investor,
        lock_days=lock_days,
        matured_at=datetime.utcnow() + timedelta(days=lock_days)
    )

    dep.flushed = True
    db.add(new_dep)
    db.commit()
    db.refresh(new_dep)

    return ActionResponse(
        message="Deposit reinvested successfully",
        amount=reinvest_amount,
        new_investment_id=new_dep.id
    )


@router.put("/config", response_model=ConfigPayload)
def update_associate_config(payload: ConfigPayload, db: Session = Depends(get_db), admin=Depends(verify_token)):
    """Admin updates referral percent and lock days."""
    # ensure only admins can hit this
    if not getattr(admin, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    config = AssociateConfig(
        referral_percent=payload.referral_percent,
        lock_days=payload.lock_days
    )
    db.add(config)
    db.commit()
    db.refresh(config)

    return ConfigPayload(
        referral_percent=config.referral_percent,
        lock_days=config.lock_days
    )


@router.get("/my-deposits")
def get_my_associate_deposits(user=Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter_by(email=user["email"]).first()
    if not db_user or not db_user.is_associate:
        raise HTTPException(status_code=403, detail="Associate access required")

    deposits = (
        db.query(Investment)
        .filter(Investment.user_email == db_user.email, Investment.is_associate == True)
        .order_by(Investment.timestamp.desc())
        .all()
    )

    result = []
    now = datetime.utcnow()
    for dep in deposits:
        if dep.flushed:
            status = "Withdrawn"
        elif dep.matured_at and now >= dep.matured_at:
            status = "Matured"
        else:
            status = "Locked"

        result.append({
            "id": dep.id,
            "amount": dep.amount,
            "source_investor": dep.source_investor,
            "timestamp": dep.timestamp,
            "lock_days": dep.lock_days,
            "matured_at": dep.matured_at,
            "roi_received": dep.roi_received,
            "status": status
        })

    return result
@router.get("/admin/config")
def get_associate_config(db: Session = Depends(get_db), admin=Depends(verify_token)):
    if not getattr(admin, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    config = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()
    if not config:
        return {"referral_percent": 0, "lock_days": 0}

    return {
        "referral_percent": float(config.referral_percent),
        "lock_days": config.lock_days,
        "updated_at": config.updated_at
    }


@router.get("/admin/summary")
def get_associate_summary(db: Session = Depends(get_db), admin=Depends(verify_token)):
    if not getattr(admin, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    total = db.query(func.sum(Investment.amount)).filter(Investment.is_associate == True).scalar() or 0
    matured = db.query(func.sum(Investment.amount)).filter(
        Investment.is_associate == True,
        Investment.matured_at <= datetime.utcnow(),
        Investment.flushed == False
    ).scalar() or 0
    withdrawn = db.query(func.sum(Investment.amount)).filter(
        Investment.is_associate == True,
        Investment.flushed == True
    ).scalar() or 0

    return {
        "total_associate_deposits": round(total, 2),
        "total_matured": round(matured, 2),
        "total_withdrawn_or_reinvested": round(withdrawn, 2)
    }
