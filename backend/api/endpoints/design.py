# backend/api/endpoints/design.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.design import Design
from schemas.design import DesignCreate, DesignOut

router = APIRouter(prefix="/designs", tags=["designs"])

@router.post("/save", response_model=DesignOut, status_code=status.HTTP_201_CREATED)
def save_design(design: DesignCreate, db: Session = Depends(get_db)):
    """Challenge 2: Endpoint to save a product customization."""
    db_design = Design(custom_text=design.custom_text)
    db.add(db_design)
    db.commit()
    db.refresh(db_design)
    return db_design

@router.get("/my", response_model=List[DesignOut])
def list_designs(db: Session = Depends(get_db)):
    """Challenge 2 Stretch Goal: Endpoint to list all saved customizations."""
    designs = db.query(Design).order_by(Design.created_at.desc()).all()
    return designs