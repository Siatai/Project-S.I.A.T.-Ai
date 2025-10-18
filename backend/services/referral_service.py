from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.models.user_model import User
from backend.models.withdrawal_model import Investment
from backend.models.referral_model import ReferralEarning
from backend.models.associate_config_model import AssociateConfig
from backend.models.commission_model import CommissionConfig
from backend.models.DirectReferralBonus import DirectReferralBonus


# ────────────────────────────────
# 📌 Referral + Associate Logic
# ────────────────────────────────
def process_referral_logic(db: Session, investment_user: User, investment: Investment):
    """
    Given a User + Investment, process referral + associate deposits + bonuses.
    Safe to call multiple times (skips duplicates).
    """

    timestamp = datetime.utcnow()

    # 🧩 Step 1: Validate referral relationship
    if not investment_user.referred_by:
        print(f"[REFERRAL] {investment_user.email} has no referrer.")
        return None

    referrer = db.query(User).filter_by(referral_code=investment_user.referred_by).first()
    config = db.query(CommissionConfig).first()

    if not referrer:
        print(f"[REFERRAL] Referrer not found for {investment_user.email}.")
        return None
    if not config:
        print("[REFERRAL] CommissionConfig not set — skipping referral credit.")
        return None

    percentage = float(config.percentage or 0)
    commission_amount = round(investment.amount * (percentage / 100), 2)

    # ────────────────────────────────
    # ✅ Step 2: Create referral earning (1-time)
    # ────────────────────────────────
    earning_exists = db.query(ReferralEarning).filter_by(
        referrer_email=referrer.email,
        referred_email=investment_user.email,
        investment_amount=investment.amount,
    ).first()

    if not earning_exists:
        earning = ReferralEarning(
            referrer_email=referrer.email,
            referred_email=investment_user.email,
            investment_amount=investment.amount,
            percentage=percentage,
            commission_amount=commission_amount,
            timestamp=timestamp,
        )
        db.add(earning)
        print(f"[REFERRAL][NEW] Logged {commission_amount:.2f} for {referrer.email} from {investment_user.email}")

    # ────────────────────────────────
    # ✅ Step 3: Credit commission instantly to referrer’s wallet
    # ────────────────────────────────
    referrer.wallet_balance = (referrer.wallet_balance or 0.0) + commission_amount
    db.add(referrer)
    print(f"[WALLET][CREDIT] {referrer.email} +{commission_amount:.2f} USD (direct commission)")

    # ────────────────────────────────
    # ✅ Step 4: Create associate mirror deposit (if config present)
    # ────────────────────────────────
    assoc_cfg = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()
    if assoc_cfg:
        exists_assoc = db.query(Investment).filter(
            Investment.is_associate == True,
            Investment.source_investor == investment_user.email,
            Investment.tx_hash == investment.tx_hash,
        ).first()

        if not exists_assoc:
            assoc_amount = round(investment.amount * (assoc_cfg.referral_percent / 100), 2)
            assoc_dep = Investment(
                user_email=referrer.email,
                amount=assoc_amount,
                is_associate=True,
                source_investor=investment_user.email,
                lock_days=assoc_cfg.lock_days,
                tx_hash=investment.tx_hash,
                matured_at=timestamp + timedelta(days=assoc_cfg.lock_days),
            )
            db.add(assoc_dep)
            print(
                f"[ASSOCIATE][CREATE] {referrer.email} credited with {assoc_amount:.2f} "
                f"({assoc_cfg.referral_percent}% of {investment.amount})"
            )

    # ────────────────────────────────
    # ✅ Step 5: Create Direct Referral Bonus record
    # ────────────────────────────────
    if assoc_cfg:
        bonus_tx_hash = f"{referrer.email}-{investment_user.email}-{investment.tx_hash}"
        exists_bonus = db.query(DirectReferralBonus).filter_by(tx_hash=bonus_tx_hash).first()

        if not exists_bonus:
            direct_bonus = DirectReferralBonus(
                referrer_email=referrer.email,
                referee_email=investment_user.email,
                amount=investment.amount,
                percentage=percentage,
                bonus_amount=commission_amount,
                tx_hash=bonus_tx_hash,
                lock_days=assoc_cfg.lock_days,
                matured_at=timestamp + timedelta(days=assoc_cfg.lock_days),
            )
            db.add(direct_bonus)
            print(f"[BONUS][NEW] DirectReferralBonus recorded for {referrer.email}")

    # ────────────────────────────────
    # ✅ Commit or Rollback
    # ────────────────────────────────
    try:
        db.commit()
        print(f"✅ Referral logic committed successfully for {investment_user.email}")
    except IntegrityError as e:
        db.rollback()
        print(f"❌ Referral processing rolled back for {investment_user.email}: {e}")
