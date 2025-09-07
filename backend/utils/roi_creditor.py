from datetime import datetime
from models.user_model import User
from models.withdrawal_model import Investment
from models.referral_model import ReferralEarning
from models.roi_model import ROIConfig
from models.commission_model import CommissionConfig

def credit_daily_roi(db):
    now = datetime.utcnow()

    # ────────────────────────────────
    # 📌 ROI CONFIG (monthly → daily)
    # ────────────────────────────────
    roi_config = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    if not roi_config:
        return {"message": "No ROI config set"}

    monthly_roi_percentage = roi_config.percentage
    daily_roi_percentage = monthly_roi_percentage / 30  # ✅ convert to daily %

    # ────────────────────────────────
    # 📌 COMMISSION CONFIG (monthly → daily)
    # ────────────────────────────────
    commission_config = db.query(CommissionConfig).first()
    commission_percentage = commission_config.percentage if commission_config else 0.0
    daily_commission_percentage = commission_percentage / 30

    credited = []

    # ────────────────────────────────
    # 📌 Process all active investments
    # ────────────────────────────────
    investments = db.query(Investment).all()
    for inv in investments:
        user = db.query(User).filter_by(email=inv.user_email).first()
        if not user:
            continue

        # How many days since deposit?
        days = (now - inv.timestamp).days
        if days <= 0:
            continue

        # ✅ Daily ROI for this investment
        daily_profit = inv.amount * (daily_roi_percentage / 100)

        # Add profit to investor's wallet
        user.wallet_balance += daily_profit

        credited.append({
            "email": user.email,
            "investment": inv.amount,
            "daily_profit": round(daily_profit, 2)
        })

        # ────────────────────────────────
        # 📌 Commission for Referrer
        # ────────────────────────────────
        if user.referred_by:
            referrer = db.query(User).filter_by(referral_code=user.referred_by).first()
            if referrer:
                commission_amount = daily_profit * (daily_commission_percentage / 100)
                referrer.wallet_balance += commission_amount

                # Record referral earning
                earning = ReferralEarning(
                    referrer_email=referrer.email,
                    referred_email=user.email,
                    investment_amount=inv.amount,
                    percentage=commission_percentage,
                    commission_amount=commission_amount,
                    timestamp=now,
                )
                db.add(earning)

    # Commit updates to DB
    db.commit()

    return {
        "message": "✅ Daily ROI + Commissions credited successfully",
        "credited": credited
    }
