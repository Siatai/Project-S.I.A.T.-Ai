from datetime import datetime, date
from models.user_model import User
from models.withdrawal_model import Investment
from models.referral_model import ReferralEarning
from models.roi_model import ROIConfig
from models.commission_model import CommissionConfig
from sqlalchemy import and_

def credit_daily_roi(db):
    now = datetime.utcnow()
    today = date.today()

    # ────────────────────────────────
    # 📌 Safety: check if ROI already credited today
    # ────────────────────────────────
    already_done = (
        db.query(ReferralEarning)
        .filter(ReferralEarning.timestamp >= datetime(today.year, today.month, today.day))
        .first()
    )
    if already_done:
        return {"message": "ROI already credited today, try again tomorrow"}

    # ────────────────────────────────
    # 📌 ROI CONFIG (monthly → daily)
    # ────────────────────────────────
    roi_config = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    if not roi_config:
        return {"message": "No ROI config set"}

    monthly_roi_percentage = roi_config.percentage
    daily_roi_percentage = monthly_roi_percentage / 30

    # ────────────────────────────────
    # 📌 COMMISSION CONFIG (monthly → daily)
    # ────────────────────────────────
    commission_config = db.query(CommissionConfig).first()
    commission_percentage = commission_config.percentage if commission_config else 0.0
    daily_commission_percentage = commission_percentage / 30

    credited = []

    # ────────────────────────────────
    # 📌 Process all investments
    # ────────────────────────────────
    investments = db.query(Investment).all()
    referral_earnings = []  # bulk insert list

    for inv in investments:
        user = db.query(User).filter_by(email=inv.user_email).first()
        if not user:
            continue

        # Skip if deposit is today (0 days old)
        days = (now - inv.timestamp).days
        if days <= 0:
            continue

        # ✅ Daily ROI for this investment
        daily_profit = inv.amount * (daily_roi_percentage / 100)
        user.wallet_balance += daily_profit

        credited.append({
            "email": user.email,
            "investment": inv.amount,
            "daily_profit": round(daily_profit, 2)
        })

        # ✅ Commission for Referrer
        if user.referred_by:
            referrer = db.query(User).filter_by(referral_code=user.referred_by).first()
            if referrer:
                commission_amount = daily_profit * (daily_commission_percentage / 100)
                referrer.wallet_balance += commission_amount

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

    # Bulk insert all referral earnings in one go
    if referral_earnings:
        db.add_all(referral_earnings)

    # Commit once for all users
    db.commit()

    return {
        "message": "✅ Daily ROI + Commissions credited successfully",
        "credited": credited,
        "count": len(credited)
    }
