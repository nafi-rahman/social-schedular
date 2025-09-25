# debug.py
from datetime import datetime, timezone
from core.database import SessionLocal
from models.post import Post

db = SessionLocal()

now_naive_utc = datetime.utcnow()          # naïve UTC
print("now_naive_utc :", now_naive_utc)

for p in db.query(Post).filter(Post.status == "pending"):
    print("post", p.id, "scheduled_time:", p.scheduled_time, "(naïve-UTC)")

    if p.scheduled_time <= now_naive_utc:
        print("  ➜  SHOULD BE PUBLISHED – flipping status")
        p.status = "published"
    else:
        print("  ➜  still in future, leaving alone")

db.commit()