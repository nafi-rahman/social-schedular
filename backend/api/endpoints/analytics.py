# backend/api/endpoints/analytics.py (FULL CODE)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.post import Post
from pydantic import BaseModel
from typing import List, Dict
import logging
from services.gemini_service import ( # <-- UPDATED IMPORT
    polish_content_service, 
    get_dynamic_insight_service,
    analyze_image_service,
    call_gemini_or_mock
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

# --- Schemas to handle API Key and Request Body ---
class AIRequest(BaseModel):
    """Base schema for AI requests to carry the temporary key."""
    gemini_key: str = ""
    
class ContentPolishRequest(AIRequest):
    text: str
    tone: str | None = None

class DynamicInsightRequest(AIRequest):
    post_counts: Dict[str, int]
    
class ImageAnalysisRequest(AIRequest):
    image_path: str # Path to the image file


class HashtagRequest(AIRequest):
    text: str
    tone: str | None = None
    
# --- Existing Endpoints (Stats) ---

@router.get("/stats")
def get_post_stats(db: Session = Depends(get_db)):
    """Challenge 3: Exposes real counts for the dashboard chart."""
    published = db.query(Post).filter(Post.status == 'published').count()
    pending = db.query(Post).filter(Post.status == 'pending').count()
    failed = db.query(Post).filter(Post.status == 'failed').count()

    return {
        "posts_published": published,
        "posts_scheduled": pending,
        "posts_failed": failed
    }

@router.post("/ai/suggest_hashtags")
def suggest_hashtags(request: HashtagRequest):
    prompt = (
        f"Suggest 5 highly-relevant, trending hashtags for the following social-media post. "
        f"Return only the hashtags, separated by spaces, no extra text.\n\n"
        f"Post: {request.text}"
    )

    def mock_tags():
        # keep your old heuristic as fallback
        tags = []
        if "coffee" in request.text.lower() or "morning" in request.text.lower():
            tags.extend(["#MorningCoffee", "#CoffeeTime", "#Brew"])
        if "coding" in request.text.lower() or "fastapi" in request.text.lower():
            tags.extend(["#CodingLife", "#FastAPI", "#WebDev"])
        return " ".join(list(set(tags))[:5])

    result, source = call_gemini_or_mock(request.gemini_key, prompt, mock_tags)
    return {"suggestions": result.split(), "source": source}


# --- NEW/UPDATED LIVE AI ENDPOINTS ---

@router.post("/ai/polish_content")
def polish_content(request: ContentPolishRequest):
    """Phase 5: Calls the Gemini Service for content rewriting/tone adjustment."""
    result = polish_content_service(request.gemini_key, request.text, request.tone)
    return result

@router.post("/ai/dynamic_insight")
def get_dynamic_ai_insight(request: DynamicInsightRequest):
    """Phase 5: Calls the Gemini Service for dynamic insights."""
    result = get_dynamic_insight_service(request.gemini_key, request.post_counts)
    return result

@router.post("/ai/analyze_image")
def analyze_image(request: ImageAnalysisRequest):
    """Phase 5: Placeholder for Gemini Vision API call."""
    result = analyze_image_service(request.gemini_key, request.image_path)
    return result