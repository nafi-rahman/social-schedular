from sqlalchemy import Column, Integer, String, DateTime
from core.database import Base

class Post(Base):
    __tablename__ = "scheduled_posts"
    id = Column(Integer, primary_key=True, index=True)
    text_content = Column(String)
    image_path = Column(String)
    platforms = Column(String)
    scheduled_time = Column(DateTime, index=True)
    status = Column(String, default="pending", index=True)