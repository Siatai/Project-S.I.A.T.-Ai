from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from backend.db import Base

class ROIConfig(Base):
    __tablename__ = "roi_config"

    id = Column(Integer, primary_key=True, index=True)
    percentage = Column(Float, nullable=False)  # ROI percentage
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
