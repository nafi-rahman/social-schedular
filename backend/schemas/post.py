from pydantic import BaseModel, validator
from datetime import datetime, timezone
from typing import List


class PostBase(BaseModel):
    text_content: str
    platforms: List[str]
    scheduled_time: datetime


class PostCreate(PostBase):
    pass


class PostOut(BaseModel):
    id: int
    text_content: str
    image_path: str | None
    platforms: List[str]
    scheduled_time: str          # ISO-8601 UTC string
    status: str

    # ----- comma-string → list -----
    @validator("platforms", pre=True)
    def _to_list(cls, v):
        if isinstance(v, str):
            return [p.strip() for p in v.split(",") if p.strip()]
        return v

    # ----- naïve UTC datetime → ISO string with +00:00 -----
    @validator("scheduled_time", pre=True)
    def _utc_iso(cls, v: datetime):
        return v.replace(tzinfo=timezone.utc).isoformat()

    class Config:
        from_attributes = True