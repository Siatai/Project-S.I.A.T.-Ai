# backend/models/commission_model.py
from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from db import Base

class CommissionConfig(Base):
    __tablename__ = "commission_config"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, nullable=False)   # 1 = direct, 2 = 2nd level, etc.
    percentage = Column(Float, nullable=False)  # % commission
    created_at = Column(DateTime, default=datetime.utcnow)
