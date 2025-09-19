from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from db import get_db
from models.user_model import User
from models.withdrawal_model import Investment
from models.associate_config_model import AssociateConfig
from utils.auth_middleware import verify_token
from models.referral_model import ReferralEarning
from models.associate_config_model import AssociateConfig



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
def update_associate_config(
    payload: ConfigPayload, 
    db: Session = Depends(get_db), 
    user=Depends(verify_token)
):
    """Update referral percent and lock days (now open)."""
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
def get_associate_config(db: Session = Depends(get_db), user=Depends(verify_token)):
    """Fetch latest associate config (no admin restriction)."""
    config = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()
    if not config:
        return {"referral_percent": 0, "lock_days": 0}

    return {
        "referral_percent": float(config.referral_percent),
        "lock_days": config.lock_days,
        "updated_at": config.updated_at
    }


@router.get("/admin/summary")
def get_associate_summary(db: Session = Depends(get_db), user=Depends(verify_token)):
    """Fetch associate deposit summary (no admin restriction)."""
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


@router.post("/admin/backfill-associates")
def backfill_associate_deposits(db: Session = Depends(get_db), user=Depends(verify_token)):
    """Backfill referral-based associate deposits (no admin restriction)."""
    config = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()
    if not config:
        raise HTTPException(status_code=400, detail="No associate config set")

    referral_percent = config.referral_percent
    lock_days = config.lock_days
    created_count = 0

    # loop all normal investor deposits
    investors = db.query(Investment).filter(Investment.is_associate == False).all()

    for inv in investors:
        db_user = db.query(User).filter_by(email=inv.user_email).first()
        if not db_user or not db_user.referred_by:
            continue

        referrer = db.query(User).filter_by(referral_code=db_user.referred_by).first()
        if not referrer:
            continue

        # check if an associate deposit already exists for this investor+tx
        exists = db.query(Investment).filter(
            Investment.is_associate == True,
            Investment.source_investor == db_user.email,
            Investment.tx_hash == inv.tx_hash
        ).first()
        if exists:
            continue

        assoc_amount = round(inv.amount * (float(referral_percent) / 100), 2)
        assoc_dep = Investment(
            user_email=referrer.email,
            amount=assoc_amount,
            is_associate=True,
            source_investor=db_user.email,
            lock_days=lock_days,
            matured_at=datetime.utcnow() + timedelta(days=lock_days)
        )
        db.add(assoc_dep)
        created_count += 1

    db.commit()
    return {"message": f"✅ Backfill complete. Created {created_count} associate deposits."}




@router.get("/associate/referral-packages")
def get_referral_packages(
    db: Session = Depends(get_db),
    token_user=Depends(verify_token)   # ✅ replaces get_current_user
):
    """
    Return all referral commission packages for the logged-in associate.
    Each package = one referral investment that generated commission.
    """
    email = token_user["email"]

    # ✅ get latest associate config (lock days)
    assoc_cfg = db.query(AssociateConfig).order_by(AssociateConfig.updated_at.desc()).first()
    lock_days = assoc_cfg.lock_days if assoc_cfg else 30

    # ✅ fetch referral earnings for this user
    earnings = (
        db.query(ReferralEarning)
        .filter(ReferralEarning.referrer_email == email)
        .all()
    )

    packages = []
    for e in earnings:
        invested_at = e.timestamp
        matured_at = invested_at + timedelta(days=lock_days)
        status = "Locked" if matured_at > invested_at else "Matured"

        packages.append({
            "referee_email": e.referred_email,
            "investment_amount": float(e.investment_amount),
            "commission_amount": float(e.commission_amount),
            "percentage": float(e.percentage),
            "timestamp": invested_at,
            "lock_days": lock_days,
            "matured_at": matured_at,
            "status": status
        })

    return {"packages": packages}
