from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """
    Initializes the database by creating all defined tables.
    Also ensures the parent directory for the SQLite file exists.
    """
    import os
    import sys
    from pathlib import Path
    
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")

    
    db_dir = Path(db_path).parent
    if not db_dir.exists():
        os.makedirs(db_dir, exist_ok=True)
        print(f"Created database directory: {db_dir}")

    
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()