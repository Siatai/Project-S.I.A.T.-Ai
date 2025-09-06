from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from db import Base

class ReferralEarning(Base):
    __tablename__ = "referral_earnings"

    id = Column(Integer, primary_key=True, index=True)
    referrer_email = Column(String, index=True)   # Who gets commission
    referred_email = Column(String, index=True)   # Investor who triggered it
    investment_amount = Column(Float)             # Base investment
    percentage = Column(Float, default=0.0)       # Commission %
    commission_amount = Column(Float, default=0.0) # Actual earning
    timestamp = Column(DateTime, default=datetime.utcnow)
