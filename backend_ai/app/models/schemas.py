from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# The shape of the data the frontend will send to us
class ProxyProfileCreate(BaseModel):
    age: int
    biological_sex: str
    antibiotic_history_6_months: bool
    daily_fiber_grams: float
    vegetarian_or_vegan: bool

# The shape of the data we will return to the frontend after saving
class ProxyProfileResponse(ProxyProfileCreate):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True