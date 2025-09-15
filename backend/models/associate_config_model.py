from sqlalchemy import Column, Integer, Numeric, DateTime, func
from db import Base


class AssociateConfig(Base):
    __tablename__ = "associate_config"

    id = Column(Integer, primary_key=True, index=True)
    referral_percent = Column(Numeric(5, 2), nullable=False, default=5.00)  # %
    lock_days = Column(Integer, nullable=False, default=30)                 # days
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
