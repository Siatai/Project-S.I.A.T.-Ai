from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint, Date, Boolean
from datetime import datetime
from db import Base
from sqlalchemy.orm import relationship

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, ForeignKey("users.email"), nullable=False)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)  # creation time
    tx_hash = Column(String, unique=True, index=True)     # blockchain tx hash
    last_roi_date = Column(Date, nullable=True)           # last credited ROI
    roi_received = Column(Float, default=0.0)             # total ROI credited
    flushed = Column(Boolean, default=False)              # if closed/settled

    # 🔹 New fields for associate deposits
    is_associate = Column(Boolean, default=False, nullable=False)   # TRUE if deposit credited to associate
    source_investor = Column(String, ForeignKey("users.email"), nullable=True)  # investor who triggered it
    lock_days = Column(Integer, nullable=True)                      # lock period in days
    matured_at = Column(DateTime, nullable=True)                    # unlock timestamp

    # Relationships
    user = relationship("User", foreign_keys=[user_email])
    source_user = relationship("User", foreign_keys=[source_investor])

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
