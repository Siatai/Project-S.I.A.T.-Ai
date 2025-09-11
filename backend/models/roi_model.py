from sqlalchemy import Column, Integer, Float, DateTime, func
from db import Base

class ROIConfig(Base):
    __tablename__ = "roi_config"
    id = Column(Integer, primary_key=True, index=True)
    percentage = Column(Float, nullable=False)
    max_roi_multiplier = Column(Float, default=2.0)  # ✅ new column
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
