from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from datetime import datetime, timedelta
from db import Base

class DirectReferralBonus(Base):
    __tablename__ = "direct_referral_bonus"

    id = Column(Integer, primary_key=True, index=True)
    referrer_email = Column(String, ForeignKey("users.email"), nullable=False)
    referee_email = Column(String, ForeignKey("users.email"), nullable=False)

    amount = Column(Float, nullable=False)         # investor’s deposit amount
    percentage = Column(Float, nullable=False)     # % set from admin config
    bonus_amount = Column(Float, nullable=False)   # commission given

    tx_hash = Column(String, unique=True, index=True)

    timestamp = Column(DateTime, default=datetime.utcnow)
    lock_days = Column(Integer, default=30)
    matured_at = Column(DateTime)
    flushed = Column(Boolean, default=False)       # withdrawn/reinvested
