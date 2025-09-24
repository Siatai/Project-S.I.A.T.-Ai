from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.models.user_model import User
from backend.models.withdrawal_model import Investment
from backend.models.referral_model import ReferralEarning
from backend.models.associate_config_model import AssociateConfig
from backend.models.commission_model import CommissionConfig
from backend.models.DirectReferralBonus import DirectReferralBonus


def process_referral_logic(db: Session, investment_user: User, investment: Investment):
    """
    Given a User + Investment, process referral + associate deposits + bonuses.
    Safe to call multiple times (skips duplicates).
    """
    timestamp = datetime.utcnow()

    if not investment_user.referred_by:
        return None

    referrer = db.query(User).filter_by(referral_code=investment_user.referred_by).first()
    config = db.query(CommissionConfig).first()

    if not referrer or not config:
        return None

    percentage = config.percentage
    commission_amount = round(investment.amount * (percentage / 100), 2)

    # ✅ Referral earning
    earning_exists = db.query(ReferralEarning).filter_by(
        referrer_email=referrer.email,
        referred_email=investment_user.email,
        investment_amount=investment.amount
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

    # ✅ Associate deposit
    assoc_cfg = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()
    if assoc_cfg:
        exists = db.query(Investment).filter(
            Investment.is_associate == True,
            Investment.source_investor == investment_user.email,
            Investment.tx_hash == investment.tx_hash
        ).first()
        if not exists:
            assoc_amount = round(investment.amount * (assoc_cfg.referral_percent / 100), 2)
            assoc_dep = Investment(
                user_email=referrer.email,
                amount=assoc_amount,
                is_associate=True,
                source_investor=investment_user.email,
                lock_days=assoc_cfg.lock_days,
                tx_hash=investment.tx_hash,
                matured_at=timestamp + timedelta(days=assoc_cfg.lock_days)
            )
            db.add(assoc_dep)

    # ✅ Direct bonus
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

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
