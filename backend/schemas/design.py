# backend/schemas/design.py

from pydantic import BaseModel
from datetime import datetime

class DesignCreate(BaseModel):
    custom_text: str

class DesignOut(BaseModel):
    id: int
    product_name: str
    custom_text: str
    created_at: datetime

    class Config:
        from_attributes = True