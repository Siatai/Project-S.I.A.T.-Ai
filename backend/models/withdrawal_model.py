from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint, Date
from datetime import datetime
from db import Base


class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, ForeignKey("users.email"))
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    tx_hash = Column(String, unique=True, index=True)  # unique blockchain tx hash
    last_roi_date = Column(Date, nullable=True)

    __table_args__ = (
        UniqueConstraint("tx_hash", name="uq_tx_hash"),
    )


class Withdrawal(Base):
    __tablename__ = "withdrawals"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, ForeignKey("users.email"), nullable=False)

    # Financials
    amount = Column(Float, nullable=False)        # requested (gross) amount
    fee = Column(Float, nullable=False)           # fee deducted (e.g. 5%)
    final_amount = Column(Float, nullable=False)  # amount after fee

    # Wallet details
    wallet = Column(String, nullable=False)

    # Lifecycle
    status = Column(String, default="pending")  # pending, approved, rejected, settled
    timestamp = Column(DateTime, default=datetime.utcnow)
    settled_at = Column(DateTime, nullable=True)  # when actually settled
    tx_hash = Column(String, nullable=True)       # blockchain transaction hash
