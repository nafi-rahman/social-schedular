from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./posts.db"
    POSTS_DIR: str = "static/posts"

    class Config:
        env_file = ".env"

settings = Settings()