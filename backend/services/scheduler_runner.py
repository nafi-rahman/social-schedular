# backend/services/scheduler_runner.py
import time
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from services.scheduler import start_scheduler, publish_pending_posts 

logging.basicConfig(level=logging.INFO)

# Use the scheduler defined in services/scheduler.py or re-define if necessary
# We'll use the one from the module for consistency.

# Ensure the jobs are set up and running
start_scheduler() 

try:
    # Keep the script alive forever
    logging.info("Scheduler Runner started successfully. Monitoring posts...")
    while True:
        time.sleep(5)
except (KeyboardInterrupt, SystemExit):
    logging.info("Scheduler Runner shutting down.")
    # The shutdown is automatically handled by the scheduler module