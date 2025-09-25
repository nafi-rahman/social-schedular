import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from models.post import Post
from core.database import SessionLocal, get_db
from datetime import datetime, timezone
import random # Phase 5: Required for mock failure

logging.basicConfig(level=logging.INFO)
scheduler = BackgroundScheduler()

def publish_post(post_id: int):
    """
    Background task to change post status and mock the actual publishing process.
    This runs inside the scheduler's executor thread.
    """
    db: Session = next(get_db()) # Use get_db() to create a session within the job
    
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        
        if post and post.status == 'pending':
            
            # --- PHASE 5: MOCK FAILURE CHECK (5% chance) ---
            if random.random() < 0.05:
                post.status = 'failed'
                logging.warning(f"❌ MOCK FAILURE: Post {post.id} failed to publish due to a simulated API error.")
            else:
                # --- Success Logic ---
                post.status = 'published'
                
                # --- PHASE 5: MOCK PLATFORM-SPECIFIC CHECK (Demonstrates extensibility) ---
                if 'instagram' in post.platforms:
                    logging.info(f"📸 Instagram publishing mock: Text length verified and image successfully resized.")

                logging.info(f"✅ Published Post {post.id} to {post.platforms} at {datetime.now(timezone.utc).isoformat()}")
            
            db.commit()
            db.refresh(post)
            
    except Exception as e:
        logging.error(f"Error processing post {post_id}: {e}")
        db.rollback()
    finally:
        db.close()


def publish_pending_posts():
    db: Session = SessionLocal()
    try:
        now_utc = datetime.now(timezone.utc)
        # Query for posts that are pending and whose scheduled time is now or in the past
        pending_posts = db.query(Post).filter(
            Post.status == "pending",
            Post.scheduled_time <= now_utc
        ).all()
        
        for post in pending_posts:
            # Instead of publishing directly, add the publishing job to the scheduler.
            # This ensures that if the publishing logic later involves a blocking call,
            # it doesn't hold up the main scheduler thread.
            scheduler.add_job(
                publish_post,
                args=[post.id],
                id=f"publish_{post.id}",
                name=f"Publish post {post.id}",
                misfire_grace_time=30, # Allow brief delay
                replace_existing=True
            )
            logging.info(f"📤 Scheduled post {post.id} for execution.")
            
    except Exception as e:
        logging.error(f"Error during main scheduler run: {e}")
        db.rollback() # Safely rollback any potential session changes
    finally:
        db.close()


def start_scheduler():
    if not scheduler.running:
        # Check for missed posts on startup
        # We run this once before starting the interval trigger
        publish_pending_posts() 
        
        scheduler.add_job(
            publish_pending_posts,
            trigger=IntervalTrigger(seconds=30),
            id="publish_posts_monitor",
            name="Publish pending posts monitor job",
            replace_existing=True
        )
        scheduler.start()
        logging.info("Scheduler started.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logging.info("Scheduler stopped.")