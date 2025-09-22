from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from db import get_db
from models.user_model import User
from models.withdrawal_model import Investment
from models.associate_config_model import AssociateConfig
from utils.auth_middleware import verify_token
from models.referral_model import ReferralEarning
from models.DirectReferralBonus import DirectReferralBonus

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
# 📌 OLD ASSOCIATE DEPOSIT APIS
# ────────────────────────────────

@router.get("/deposits")
def get_associate_deposits(db: Session = Depends(get_db), user=Depends(verify_token)):
    """List all deposits credited to associate (old system)."""
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
    """Withdraw matured associate deposit + ROI (old system)."""
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
    """Reinvest matured associate deposit into a new cycle (old system)."""
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


@router.get("/my-deposits")
def get_my_associate_deposits(user=Depends(verify_token), db: Session = Depends(get_db)):
    """List all associate deposits for logged-in user (old system)."""
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


# ────────────────────────────────
# 📌 DIRECT REFERRAL BONUS APIS (NEW)
# ────────────────────────────────

@router.get("/direct-bonuses")
def get_direct_bonuses(
    db: Session = Depends(get_db),
    token_user=Depends(verify_token)
):
    """List all direct referral bonuses for the logged-in associate."""
    email = token_user["email"]

    bonuses = db.query(DirectReferralBonus).filter(
        DirectReferralBonus.referrer_email == email
    ).order_by(DirectReferralBonus.timestamp.desc()).all()

    result = []
    now = datetime.utcnow()
    for b in bonuses:
        status = "Withdrawn" if b.flushed else (
            "Matured" if now >= b.matured_at else "Locked"
        )
        result.append({
            "id": b.id,
            "referee_email": b.referee_email,
            "amount": b.amount,
            "percentage": b.percentage,
            "bonus_amount": b.bonus_amount,
            "timestamp": b.timestamp,
            "lock_days": b.lock_days,
            "matured_at": b.matured_at,
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
    bonus = db.query(DirectReferralBonus).filter(
        DirectReferralBonus.id == bonus_id,
        DirectReferralBonus.referrer_email == email
    ).first()

    if not bonus:
        raise HTTPException(status_code=404, detail="Bonus not found")

    if bonus.flushed:
        raise HTTPException(status_code=400, detail="Already withdrawn or reinvested")

    if datetime.utcnow() < bonus.matured_at:
        raise HTTPException(status_code=400, detail="Bonus still locked")

    payout_amount = bonus.bonus_amount
    bonus.flushed = True
    db.commit()

    return ActionResponse(
        message=f"Bonus {bonus_id} withdrawn successfully",
        amount=payout_amount
    )


@router.post("/direct-bonuses/{bonus_id}/reinvest", response_model=ActionResponse)
def reinvest_direct_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    token_user=Depends(verify_token)
):
    """Reinvest a matured referral bonus into a new associate deposit."""
    email = token_user["email"]
    bonus = db.query(DirectReferralBonus).filter(
        DirectReferralBonus.id == bonus_id,
        DirectReferralBonus.referrer_email == email
    ).first()

    if not bonus:
        raise HTTPException(status_code=404, detail="Bonus not found")

    if bonus.flushed:
        raise HTTPException(status_code=400, detail="Already withdrawn or reinvested")

    if datetime.utcnow() < bonus.matured_at:
        raise HTTPException(status_code=400, detail="Bonus still locked")

    # Create a new Investment for reinvestment
    new_dep = Investment(
        user_email=email,
        amount=bonus.bonus_amount,
        is_associate=True,
        source_investor=bonus.referee_email,
        lock_days=bonus.lock_days,
        matured_at=datetime.utcnow() + timedelta(days=bonus.lock_days)
    )
    db.add(new_dep)

    bonus.flushed = True
    db.commit()
    db.refresh(new_dep)

    return ActionResponse(
        message=f"Bonus {bonus_id} reinvested successfully",
        amount=bonus.bonus_amount,
        new_investment_id=new_dep.id
    )


@router.get("/associate/referral-packages")
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

    q = db.query(DirectReferralBonus).filter(
        DirectReferralBonus.referrer_email == associate_email
    )
    if email:
        q = q.filter(DirectReferralBonus.referee_email == email)

    bonuses = q.order_by(DirectReferralBonus.timestamp.asc()).all()
    now = datetime.utcnow()

    packages = []
    for b in bonuses:
        status = "Withdrawn" if b.flushed else (
            "Matured" if now >= b.matured_at else "Locked"
        )
        packages.append({
            "id": b.id,
            "referee_email": b.referee_email,
            "amount": float(b.amount),
            "bonus_amount": float(b.bonus_amount),
            "percentage": float(b.percentage),
            "timestamp": b.timestamp.isoformat(),
            "lock_days": b.lock_days,
            "matured_at": b.matured_at.isoformat(),
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
    """Fetch associate deposit summary (old system)."""
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
    """Backfill referral-based associate deposits (old system)."""
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

@router.post("/admin/backfill-direct-bonuses")
def backfill_direct_referral_bonuses(
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    """
    Retro entry: Create missing DirectReferralBonus rows 
    from past ReferralEarnings + Investments.
    """

    config = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()
    lock_days = config.lock_days if config else 30

    created_count = 0
    skipped_count = 0

    # Loop through all referral earnings
    earnings = db.query(ReferralEarning).all()
    for e in earnings:
        # Find the investment that triggered this earning
        inv = (
            db.query(Investment)
            .filter(Investment.user_email == e.referred_email)
            .order_by(Investment.timestamp.asc())  # oldest first
            .first()
        )
        if not inv:
            skipped_count += 1
            continue

        # Check if a DirectReferralBonus already exists
        exists = db.query(DirectReferralBonus).filter_by(
            referrer_email=e.referrer_email,
            referee_email=e.referred_email,
            tx_hash=inv.tx_hash
        ).first()

        if exists:
            skipped_count += 1
            continue

        # Create new DirectReferralBonus
        bonus = DirectReferralBonus(
            referrer_email=e.referrer_email,
            referee_email=e.referred_email,
            amount=inv.amount,
            percentage=e.percentage,
            bonus_amount=e.commission_amount,
            tx_hash=inv.tx_hash,
            timestamp=inv.timestamp,
            lock_days=lock_days,
            matured_at=inv.timestamp + timedelta(days=lock_days),
            flushed=False
        )
        db.add(bonus)
        created_count += 1

    db.commit()

    return {
        "message": f"Backfill complete ✅",
        "created": created_count,
        "skipped_existing": skipped_count
    }
