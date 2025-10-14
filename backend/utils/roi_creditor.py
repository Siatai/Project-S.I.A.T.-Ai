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
    today = date.today()

    # ✅ Safety: check if ROI already credited today
    already_done = (
        db.query(ReferralEarning)
        .filter(ReferralEarning.timestamp >= datetime(today.year, today.month, today.day))
        .first()
    )
    if already_done:
        return {"message": "ROI already credited today, try again tomorrow"}

    return _process_roi_and_commissions(db, force=False)


# ────────────────────────────────
# 📌 Force ROI Credit (multi-run same day)
# ────────────────────────────────
def force_credit_daily_roi(db: Session):
    return _process_roi_and_commissions(db, force=True)


# ────────────────────────────────
# 📌 Core ROI + Commission Logic
# ────────────────────────────────
def _process_roi_and_commissions(db: Session, force: bool = False):
    now = datetime.utcnow()
    today = date.today()

    # ROI CONFIG
    roi_config = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    if not roi_config:
        return {"message": "❌ No ROI config set"}

    monthly_roi_percentage = roi_config.percentage
    daily_roi_percentage = monthly_roi_percentage / 30.0
    max_multiplier = getattr(roi_config, "max_roi_multiplier", 2.0)

    # COMMISSION CONFIG
    commission_config = db.query(CommissionConfig).first()
    commission_percentage = commission_config.percentage if commission_config else 0.0

    credited = []
    referral_earnings = []

    # ✅ Loop through ALL investments
    investments = db.query(Investment).all()
    for inv in investments:
        user = db.query(User).filter_by(email=inv.user_email).first()
        if not user:
            continue

        # Determine days since last credit
        last_date = inv.last_roi_date or inv.timestamp.date()
        days_to_credit = (today - last_date).days
        if days_to_credit <= 0:
            continue

        # ✅ Flush protection
        max_return = inv.amount * max_multiplier
        roi_received = inv.roi_received or 0.0
        remaining_cap = max_return - roi_received
        if remaining_cap <= 0:
            continue

        # ROI calculation
        daily_profit = inv.amount * (daily_roi_percentage / 100.0)
        total_profit = daily_profit * days_to_credit
        if total_profit > remaining_cap:
            total_profit = remaining_cap

        # ✅ Update investor wallet + investment record
        user.wallet_balance = (user.wallet_balance or 0.0) + total_profit
        inv.roi_received = roi_received + total_profit
        inv.last_roi_date = today
        db.add(user)
        db.add(inv)

        credited.append({
            "email": user.email,
            "investment": inv.amount,
            "days": days_to_credit,
            "credited_profit": round(total_profit, 2),
            "roi_received": round(inv.roi_received, 2),
            "max_return": round(max_return, 2),
            "flushed": inv.roi_received >= max_return,
            "force_mode": force,
            "is_associate": inv.is_associate
        })

        # ────────────────────────────────
        # 📌 Referral Commission credit
        # ────────────────────────────────
        if user.referred_by and total_profit > 0 and not inv.is_associate:
            referrer = db.query(User).filter_by(referral_code=user.referred_by).first()
            if referrer and commission_percentage > 0:
                commission_amount = total_profit * (commission_percentage / 100.0)

                # ⚡ Direct SQL update to avoid ORM edge cases
                db.query(User).filter(User.id == referrer.id).update(
                    {User.wallet_balance: User.wallet_balance + commission_amount},
                    synchronize_session=False
                )

                # Record the earning
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

                db.flush()  # ensure DB state is current

                print(
                    f"[COMMISSION][OK] {referrer.email} +{commission_amount:.4f} "
                    f"from {user.email} (ROI {total_profit:.4f})"
                )

    # ✅ Save all referral earnings
    if referral_earnings:
        db.add_all(referral_earnings)

    # ✅ Commit transaction
    db.commit()

    print(f"✅ ROI + Commissions credited for {len(credited)} users")

    return {
        "message": "✅ ROI + Commissions credited successfully",
        "credited": credited,
        "count": len(credited),
        "force_mode": force,
    }
