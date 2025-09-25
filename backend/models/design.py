# backend/models/design.py

from sqlalchemy import Column, Integer, String, DateTime, func
from core.database import Base

class Design(Base):
    __tablename__ = "saved_designs"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, default="T-Shirt")
    custom_text = Column(String)
    created_at = Column(DateTime, server_default=func.now())