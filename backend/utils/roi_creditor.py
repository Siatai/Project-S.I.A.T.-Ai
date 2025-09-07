from datetime import datetime
from models.user_model import User
from models.withdrawal_model import Investment
from models.referral_model import ReferralEarning
from models.roi_model import ROIConfig
from models.commission_model import CommissionConfig
from utils.user_logic import calculate_investor_roi

def credit_daily_roi(db):
    now = datetime.utcnow()

    # Get latest ROI config (monthly %)
    roi_config = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    if not roi_config:
        return {"message": "No ROI config set"}

    # Convert to daily ROI %
    daily_roi_percentage = roi_config.percentage / 30

    # Get latest Commission config (monthly %)
    commission_config = db.query(CommissionConfig).first()
    commission_percentage = commission_config.percentage if commission_config else 0.0
    daily_commission_percentage = commission_percentage / 30  # ✅ convert monthly → daily

    credited = []

    investments = db.query(Investment).all()
    for inv in investments:
        user = db.query(User).filter_by(email=inv.user_email).first()
        if not user:
            continue

        # ✅ Calculate days since deposit
        days = (now - inv.timestamp).days
        if days <= 0:
            continue

        # ✅ Daily ROI for this investment
        daily_profit = inv.amount * (daily_roi_percentage / 100)

        # Add profit to investor wallet
        user.wallet_balance += daily_profit

        credited.append({
            "email": user.email,
            "daily_profit": round(daily_profit, 2)
        })

        # ✅ Commission to referrer (if exists)
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
                    timestamp=now
                )
                db.add(earning)

    db.commit()
    return {"message": "Daily ROI + Commissions credited", "credited": credited}
