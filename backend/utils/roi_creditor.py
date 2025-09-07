from datetime import datetime, date
from sqlalchemy.orm import Session
from models.user_model import User
from models.withdrawal_model import Investment
from models.referral_model import ReferralEarning
from models.roi_model import ROIConfig
from models.commission_model import CommissionConfig

# ────────────────────────────────
# 📌 Safe ROI Credit (once per day)
# ────────────────────────────────
def credit_daily_roi(db: Session):
    now = datetime.utcnow()
    today = date.today()

    # ✅ Safety: check if ROI already credited today
    already_done = (
        db.query(ReferralEarning)
        .filter(ReferralEarning.timestamp >= datetime(today.year, today.month, today.day))
        .first()
    )
    if already_done:
        return {"message": "ROI already credited today, try again tomorrow"}

    return _process_roi_and_commissions(db, now, force=False)


# ────────────────────────────────
# 📌 Force ROI Credit (multi-run in same day)
# ────────────────────────────────
def force_credit_daily_roi(db: Session):
    now = datetime.utcnow()
    return _process_roi_and_commissions(db, now, force=True)


# ────────────────────────────────
# 📌 Core logic (used by both safe + force)
# ────────────────────────────────
def _process_roi_and_commissions(db: Session, now: datetime, force: bool = False):
    # ROI CONFIG
    roi_config = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    if not roi_config:
        return {"message": "No ROI config set"}

    monthly_roi_percentage = roi_config.percentage
    daily_roi_percentage = monthly_roi_percentage / 30  # ✅ daily ROI %

    # COMMISSION CONFIG
    commission_config = db.query(CommissionConfig).first()
    commission_percentage = commission_config.percentage if commission_config else 0.0

    credited = []
    referral_earnings = []

    # Process all active investments
    investments = db.query(Investment).all()
    for inv in investments:
        user = db.query(User).filter_by(email=inv.user_email).first()
        if not user:
            continue

        # Skip if deposit is today
        days = (now - inv.timestamp).days
        if days <= 0:
            continue

        # ✅ Daily ROI
        daily_profit = inv.amount * (daily_roi_percentage / 100)
        user.wallet_balance = (user.wallet_balance or 0.0) + daily_profit

        credited.append({
            "email": user.email,
            "investment": inv.amount,
            "daily_profit": round(daily_profit, 2),
            "force_mode": force
        })

        # ✅ Commission (referrer earns % of investor’s ROI)
        if user.referred_by:
            referrer = db.query(User).filter_by(referral_code=user.referred_by).first()
            if referrer:
                commission_amount = daily_profit * (commission_percentage / 100)  # ✅ FIXED
                referrer.wallet_balance = (referrer.wallet_balance or 0.0) + commission_amount

                referral_earnings.append(
                    ReferralEarning(
                        referrer_email=referrer.email,
                        referred_email=user.email,
                        investment_amount=inv.amount,
                        percentage=commission_percentage,
                        commission_amount=commission_amount,
                        timestamp=now,
                    )
                )

    # Bulk insert all referral earnings
    if referral_earnings:
        db.add_all(referral_earnings)

    # Commit everything in one go
    db.commit()

    return {
        "message": "✅ ROI + Commissions credited successfully",
        "credited": credited,
        "count": len(credited),
        "force_mode": force,
    }
