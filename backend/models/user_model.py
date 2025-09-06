from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from datetime import datetime
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)  # Keep original
    email_lower = Column(String, unique=True, index=True)  # ✅ New constraint

    is_associate = Column(Boolean, default=False)
    pending_associate = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)

    referral_code = Column(String, unique=True)
    referred_by = Column(String, ForeignKey('users.referral_code'), nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    wallet = Column(String, unique=True, nullable=True)
    wallet_balance = Column(Float, default=0.0)
