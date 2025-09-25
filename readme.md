🚀 Project README: Social Agent Scheduling Platform
✨ AI-Powered Social Agent: Exceeding Expectations
This submission presents a fully containerized, full-stack application built to successfully complete the three interview challenges. The solution is architecturally decoupled, using a dedicated service-oriented approach to demonstrate best practices in production environments.

The project goes beyond the "Stretch Goals" by implementing live AI integration with the Gemini API for key features and deploying the application using a robust Docker Compose setup that ensures a zero-troubleshooting experience for the reviewer.

🎯 Recruiter Highlights (Key Achievements)
Challenge Met	Implementation Details	Architectural Excellence
Challenge 1 (Core)	Full scheduling, image upload, and database persistence.	Decoupled Architecture: The API (backend) and the scheduler (scheduler) run as separate Docker services, ensuring API responsiveness is never blocked by background tasks.
Stretch Goal 1: AI Helper	Implemented Live Gemini API for dynamic Content Polishing and Insight Generation. Includes a secure user key handling mechanism (sessionStorage).	Robust Fallback: A dedicated gemini_service.py ensures the application never fails, even if the Gemini API is down, by reverting to a mock response.
Challenge 2 & 3 (Minis)	Complete implementation of Product Design Preview and a dynamic Analytics Dashboard.	Clear Service Separation: All AI, scheduling, and database logic are isolated into distinct service modules for maintainability.
Submission Guideline	Provided Robust Docker deployment for one-command startup, along with detailed manual instructions for fallback.	Data Persistence: Uses Docker volumes to ensure the SQLite database and uploaded images are persistent across container restarts.

Export to Sheets
💻 Quick Start (One-Command Deployment)
The fastest and easiest way to run the entire application is using Docker Compose.

Prerequisites
Docker and Docker Compose installed.

1. Build and Run the Stack
Execute the following command from the project root directory:

Bash

docker compose up --build -d
This command will:

Build the backend (FastAPI) and frontend (Next.js) Docker images.

Start three services: frontend, backend (API), and a dedicated scheduler.

Set up persistent volumes for the database and images.

2. Access the Application
The frontend will be available at:

http://localhost:3000

3. Key Endpoints
Service	Endpoint	Port	Description
Frontend	http://localhost:3000	3000	The main user interface.
Backend API	http://localhost:8001	8001	Base API endpoint.
Swagger Docs	http://localhost:8001/docs	8001	FastAPI interactive documentation.

Export to Sheets
🗺️ Project Structure
The project maintains a clear separation between the Next.js frontend and the FastAPI backend.

social-agent-scheduling/
├── backend/
│   ├── api/
│   │   └── endpoints/ (post.py, analytics.py, design.py)
│   ├── core/
│   │   └── (main.py, database.py)
│   ├── services/
│   │   └── (scheduler.py, gemini_service.py, upload_service.py)
│   ├── db_data/ (DB Persistence Volume)
│   ├── images/  (Image Persistence Volume)
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── ...
├── frontend/
│   ├── app/
│   │   └── (page.js, design/page.js, dashboard/page.js)
│   ├── components/
│   │   └── (Header.js, LoadingSpinner.js, etc.)
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── ...
🛠️ Technology Stack & Libraries
Component	Technology	Key Libraries	Role in Project
Backend	FastAPI (Python 3.11)	SQLAlchemy, Uvicorn, Pydantic, python-multipart	Handles API logic, data validation, and scheduling.
Database	SQLite	SQLAlchemy (ORM)	Lightweight, persistent database for post and design data.
Scheduler	APScheduler	apscheduler	Dedicated background process for auto-publishing scheduled posts.
AI Integration	Google Gemini API	google-genai	Provides dynamic content polishing and dashboard insights.
Frontend	Next.js 14 (App Router)	React.js, Tailwind CSS	User interface, state management, and API key handling.
Deployment	Docker & Docker Compose		Orchestrates and isolates all services into a single environment.

Export to Sheets
🧩 Detailed Challenge Mapping
The project architecture was explicitly designed to address and exceed the requirements of all three challenges:

Challenge 1: AI Agent with Social Posting & Scheduling (Core)
Task	Implementation	Files Involved
FastAPI Service	Implemented post creation endpoint accepting text, image (UploadFile), platforms, and scheduled time.	backend/api/endpoints/post.py
DB Storage	Post model stores all metadata and image paths.	backend/models/post.py, backend/core/database.py
Background Scheduler	A decoupled scheduler service polls the database every 15 seconds to auto-publish (update status) posts whose scheduled time is in the past.	docker-compose.yml (dedicated service), backend/services/scheduler.py
List Posts & Status	The main page lists all posts, showing the mock platform(s), image preview, and status (Scheduled, Published, Failed).	frontend/app/page.js, backend/api/endpoints/post.py
Stretch Goal: AI Helper	Live Gemini Content Polisher added to the main posting form. Securely uses the user-provided Gemini key for live API calls, falling back to mock text if the key is invalid or the API fails.	backend/services/gemini_service.py, frontend/app/page.js

Export to Sheets
Challenge 2: Product Customization Preview (Mini)
Task	Implementation	Files Involved
Frontend Preview	A dedicated design page allows a user to input text and visualize it overlaid on a mock image.	frontend/app/design/page.js
Backend Save	An endpoint saves the product image and text details to the Design table in the database.	backend/api/endpoints/design.py, backend/models/design.py
Stretch Goal: My Designs	A small gallery on the design page displays saved customizations fetched from the backend.	frontend/app/design/page.js

Export to Sheets
Challenge 3: Analytics Dashboard (Mini)
Task	Implementation	Files Involved
Backend Summary Data	An endpoint provides real-time counts of Published, Scheduled, and Failed posts.	backend/api/endpoints/analytics.py
AI-Generated Insight	An endpoint uses Live Gemini to analyze the real-time post statistics and generate a dynamic, actionable insight (e.g., "Schedule more posts, your failure rate is low"). Includes the robust mock fallback.	backend/api/endpoints/analytics.py, backend/services/gemini_service.py
Frontend Display	The dashboard displays the counts using clean stat cards and prominently features the AI Insight.	frontend/app/dashboard/page.js

Export to Sheets
Manual Setup (Fallback Instructions)
If Docker is not an option, you can run the services separately.

Prerequisites
Python 3.11+

Node.js 20+

Poetry (for Python dependency management)

1. Backend Setup
Bash

# In the project root directory
cd backend

# Install dependencies
pip install poetry
poetry install

# Manually create the persistence folders
mkdir -p db_data
mkdir -p images

# Run database initialization and the main API (Port 8001)
# Note: This version will *not* start the scheduler, which is handled separately below.
uvicorn core.main:app --host 0.0.0.0 --port 8001 --reload
2. Scheduler Process
In a separate terminal window, start the scheduler process:

Bash

# In the backend directory
poetry run python services/scheduler_runner.py
3. Frontend Setup
In a third terminal window, set up and run the Next.js frontend:

Bash

# In the project root directory
cd frontend

# Install dependencies
npm install

# Run the frontend (Port 3000)
npm run dev
The application will be available at http://localhost:3000. You will need to manually ensure the FastAPI services are running before accessing the frontend.