import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class ProxyProfile(Base):
    __tablename__ = "proxy_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    age = Column(Integer, nullable=False)
    biological_sex = Column(String, nullable=False)
    antibiotic_history_6_months = Column(Boolean, nullable=False)
    daily_fiber_grams = Column(Float, nullable=False)
    vegetarian_or_vegan = Column(Boolean, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)