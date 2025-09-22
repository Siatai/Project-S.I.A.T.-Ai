from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from db import get_db
from models.user_model import User
from models.withdrawal_model import Investment
from models.associate_config_model import AssociateConfig
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
# 📌 DIRECT REFERRAL BONUS (associate deposits)
# ────────────────────────────────

@router.get("/direct-bonuses")
def get_direct_bonuses(
    db: Session = Depends(get_db),
    token_user=Depends(verify_token)
):
    """List all direct referral bonuses for the logged-in associate."""
    email = token_user["email"]

    bonuses = db.query(Investment).filter(
        Investment.user_email == email,
        Investment.is_associate == True
    ).order_by(Investment.timestamp.desc()).all()

    result = []
    now = datetime.utcnow()
    for b in bonuses:
        if b.flushed:
            status = "Withdrawn"
        elif b.matured_at and now >= b.matured_at:
            status = "Matured"
        else:
            status = "Locked"

        result.append({
            "id": b.id,
            "referee_email": b.source_investor,
            "amount": b.amount,
            "timestamp": b.timestamp,
            "lock_days": b.lock_days,
            "matured_at": b.matured_at,
            "roi_received": b.roi_received,
            "status": status,
        })

    return {"bonuses": result}


@router.post("/direct-bonuses/{bonus_id}/withdraw", response_model=ActionResponse)
def withdraw_direct_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    token_user=Depends(verify_token)
):
    """Withdraw a matured referral bonus."""
    email = token_user["email"]
    bonus = db.query(Investment).filter(
        Investment.id == bonus_id,
        Investment.user_email == email,
        Investment.is_associate == True
    ).first()

    if not bonus:
        raise HTTPException(status_code=404, detail="Bonus not found")

    if bonus.flushed:
        raise HTTPException(status_code=400, detail="Already withdrawn or reinvested")

    if not bonus.matured_at or datetime.utcnow() < bonus.matured_at:
        raise HTTPException(status_code=400, detail="Bonus still locked")

    payout_amount = bonus.amount + (bonus.roi_received or 0)
    bonus.flushed = True
    db.commit()

    return ActionResponse(
        message=f"Bonus {bonus_id} withdrawn successfully",
        amount=payout_amount,
        wallet=getattr(token_user, "wallet", None)
    )


@router.post("/direct-bonuses/{bonus_id}/reinvest", response_model=ActionResponse)
def reinvest_direct_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    token_user=Depends(verify_token)
):
    """Reinvest a matured referral bonus into a new associate deposit."""
    email = token_user["email"]
    bonus = db.query(Investment).filter(
        Investment.id == bonus_id,
        Investment.user_email == email,
        Investment.is_associate == True
    ).first()

    if not bonus:
        raise HTTPException(status_code=404, detail="Bonus not found")

    if bonus.flushed:
        raise HTTPException(status_code=400, detail="Already withdrawn or reinvested")

    if not bonus.matured_at or datetime.utcnow() < bonus.matured_at:
        raise HTTPException(status_code=400, detail="Bonus still locked")

    reinvest_amount = bonus.amount + (bonus.roi_received or 0)
    config = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()
    lock_days = config.lock_days if config else 30

    new_dep = Investment(
        user_email=email,
        amount=reinvest_amount,
        is_associate=True,
        source_investor=bonus.source_investor,
        lock_days=lock_days,
        matured_at=datetime.utcnow() + timedelta(days=lock_days)
    )

    bonus.flushed = True
    db.add(new_dep)
    db.commit()
    db.refresh(new_dep)

    return ActionResponse(
        message=f"Bonus {bonus_id} reinvested successfully",
        amount=reinvest_amount,
        new_investment_id=new_dep.id
    )


@router.get("/referral-packages")
def get_referral_packages(
    db: Session = Depends(get_db),
    token_user=Depends(verify_token),
    email: str = Query(None)  # optional filter
):
    """
    If ?email is passed → return bonuses for that referee only.
    Otherwise → return all bonuses for the associate.
    """
    associate_email = token_user["email"]

    q = db.query(Investment).filter(
        Investment.user_email == associate_email,
        Investment.is_associate == True
    )
    if email:
        q = q.filter(Investment.source_investor == email)

    bonuses = q.order_by(Investment.timestamp.asc()).all()
    now = datetime.utcnow()

    packages = []
    for b in bonuses:
        if b.flushed:
            status = "Withdrawn"
        elif b.matured_at and now >= b.matured_at:
            status = "Matured"
        else:
            status = "Locked"

        packages.append({
            "id": b.id,
            "referee_email": b.source_investor,
            "amount": float(b.amount),
            "timestamp": b.timestamp.isoformat(),
            "lock_days": b.lock_days,
            "matured_at": b.matured_at.isoformat() if b.matured_at else None,
            "status": status
        })

    return {"packages": packages}


# ────────────────────────────────
# 📌 ADMIN CONFIG APIS
# ────────────────────────────────

@router.put("/config", response_model=ConfigPayload)
def update_associate_config(
    payload: ConfigPayload,
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    """Update referral percent and lock days."""
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


@router.get("/admin/config")
def get_associate_config(db: Session = Depends(get_db), user=Depends(verify_token)):
    """Fetch latest associate config."""
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
    """Fetch associate deposit summary."""
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
    """Backfill referral-based associate deposits."""
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
