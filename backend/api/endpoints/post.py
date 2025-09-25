from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import List
from models.post import Post
from schemas.post import PostOut
from core.database import get_db
from datetime import datetime, timezone
from pydantic import validator   # <── added
import shutil
import os
import uuid

router = APIRouter(prefix="/posts", tags=["posts"])

POSTS_DIR = "static/posts"
if not os.path.exists(POSTS_DIR):
    os.makedirs(POSTS_DIR)


# ----------  POST  ----------
@router.post("/", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_scheduled_post(
    text_content: str = Form(...),
    platforms: str = Form(...),
    scheduled_time: datetime = Form(...),
    image_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate file type
    if image_file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, or WebP images are allowed."
        )

    try:
        platform_list = [p.strip() for p in platforms.split(",")]

        # Generate a unique file name to prevent overwrites
        file_ext = os.path.splitext(image_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        image_path = os.path.join(POSTS_DIR, unique_filename)

        # Save the image file
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image_file.file, buffer)

        # Convert scheduled time to UTC and strip tzinfo (naïve UTC)
        scheduled_time_utc = scheduled_time.replace(tzinfo=timezone.utc)

        db_post = Post(
            text_content=text_content,
            image_path=image_path,
            platforms=", ".join(platform_list),
            scheduled_time=scheduled_time_utc.replace(tzinfo=None),  # naïve UTC
            status="pending"
        )
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        return db_post
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )


# ----------  LIST  ----------
@router.get("/", response_model=List[PostOut])
def list_scheduled_posts(db: Session = Depends(get_db)):
    return db.query(Post).all()