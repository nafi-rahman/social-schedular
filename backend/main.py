

# backend/core/main.py (Corrected for Docker Architecture)

# import uvicorn
# import os
# from contextlib import asynccontextmanager
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles

# # Database and Model Imports
# from core.database import Base, engine, init_db
# from models import post as post_model
# from models import design as design_model

# # Endpoint Imports
# from api.endpoints import post, analytics, design

# # You would start the scheduler in a separate process, as per our
# # discussion about Docker. This code is for the manual setup fallback.
# # from services.scheduler import start_scheduler, stop_scheduler

# # Define the lifespan context manager
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """
#     Handles application startup and shutdown events.
#     """
#     print("Application startup...")

#     # Create the database tables
#     init_db()

#     # Create the static directories if they don't exist
#     # This aligns with the `app.mount` directory
#     if not os.path.exists("static"):
#         os.makedirs("static")
#     if not os.path.exists("static/posts"):
#         os.makedirs("static/posts")
    
#     # You would start the scheduler here if it were part of the API process
#     # start_scheduler()

#     yield  # The application is running
    
#     print("Application shutdown...")
#     # You would stop the scheduler here
#     # stop_scheduler()


# app = FastAPI(
#     title="Social Agent API",
#     description="A lightweight AI-powered agent for social posting and scheduling.",
#     lifespan=lifespan # Use the lifespan context manager
# )

# # CORS middleware to allow cross-origin requests from the Next.js frontend
# origins = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "*"
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Mount the static files directory to serve images, with a path that matches the frontend.
# app.mount("/static", StaticFiles(directory="static"), name="static")

# # Include the routers for all challenges
# app.include_router(post.router)
# app.include_router(analytics.router)
# app.include_router(design.router)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.database import Base, engine
from api.endpoints import post
from services.scheduler import start_scheduler, stop_scheduler
import uvicorn
from datetime import datetime, timezone
from api.endpoints import post, design, analytics
from models import post as post_model
from models import design as design_model



app = FastAPI(
    title="Social Agent API",
    description="A lightweight AI-powered agent for social posting and scheduling."
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    '*',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    start_scheduler()

@app.on_event("shutdown")
def on_shutdown():
    stop_scheduler()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(post.router)
app.include_router(analytics.router)
app.include_router(design.router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)