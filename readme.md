# Social media schedular

A production-ready solution to Abedin Tech’s Full Stack Web Developer Interview Challenge, built with FastAPI, Next.js, React, SQLite, and AI integrations.

This project was developed in phases, starting with a minimal MVP and gradually layering in advanced features, AI-powered enhancements, and UI/UX polish.

### 🌟 Key Highlights

- ✅ Core scheduling app (text + image + platforms) with a single-process FastAPI + APScheduler backend.
- ✅ SQLite persistence with clean SQLAlchemy models.
- ✅ Next.js + React frontend with responsive forms, real-time previews, and dashboards.
- ✅ AI-powered features: hashtag suggestion, post rewriter, and insights (Gemini API mock).
- ✅ Extra UX polish: dark mode, loading states, status badges, customizable fonts/colors.
- ✅ Dockerized setup for one-command deployment (`docker compose up`).

### 🛠️ Tech Stack

- **Backend:** FastAPI, SQLAlchemy ORM, APScheduler, Alembic
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts
- **Database:** SQLite
- **AI Integrations:** Gemini API (mock/static for demo)
- **DevOps:** Docker, docker-compose

### 📅 Development Phases

**Phase 1 – Core Foundation (MVP)**
A foundational FastAPI backend with a `scheduled_posts` table, endpoints for post creation and retrieval, and a simple APScheduler background job. A basic Next.js frontend with a form and a post list was developed to interact with the API.

**Phase 2 – Mini Challenges**

- **Product Customizer:** Added a design customizer for T-shirts with live text overlay, supported by `POST /save_design` and `GET /my_designs` endpoints.
- **Analytics Dashboard:** Implemented a dashboard with `GET /analytics/stats` to visualize real post data using Recharts, showing a breakdown of post statuses (published, scheduled, failed).

**Phase 3 – Polish & Presentation**
Focused on improving the project's overall quality. This included writing clear README documentation, generating Swagger/OpenAPI docs for all endpoints, and refactoring the codebase with comments and reusable React components.

**Phase 4 – UI/UX Flair**
Enhanced the user experience with new features like a dark mode toggle, a sidebar navigation for different app sections, and enhanced charts with more detailed data. Status badges and loading spinners were added to provide clearer user feedback.

**Phase 5 – AI Enhancements**
Integrated mock AI services to add smart features to the app. This phase included a hashtag generator, a text tone adjuster, and AI insights based on recent posts, simulating a Gemini API integration.

**Phase** 6 – Final **Architecture Polish**
The entire application stack was containerized using Docker. A `docker-compose.yml` file was created to orchestrate a single-container backend (that runs both the FastAPI server and the APScheduler), a frontend service, and a database volume. This enables the entire application to be run with a single command.

### 🧠 Architecture Diagram

The application is built on a simple client-server architecture. The Next.js frontend communicates with a single FastAPI backend container via REST API calls. The backend handles all business logic, database interactions, and also runs the background scheduler to publish posts at their designated times.

### ⚡ Quick Start

### 

1. **Clone the Repo**
    
    ```
    git clone 
    cd to project root
    
    ```
    
2. **Run with Docker**
    
    ```
    docker compose up --build -d
    
    ```
    
    This single command will build and start all three services (backend, frontend, and database).
    

## **Manual Setup (Alternative)**

**Backend Setup**

```
cd backend
python -m venv venv
source venv/bin/activate   # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload

```

*Runs on `http://localhost:8001`*

**Frontend Setup**

```
cd frontend
npm install
npm run dev

```

*Runs on `http://localhost:3000`*

1. **Access the App**
    - **Frontend:** Open your browser and navigate to `http://localhost:3000`.
    - **Backend API Docs:** View the API documentation at `http://localhost:8001/docs`.

### 📸 Screenshots

<img src="./assets/scheduler.png" width="700" alt="Scheduler and Post List View" />

<img src="./assets/customizer.png" width="700" alt="Product Customizer Page" />

<img src="./assets/dashboard.png" width="700" alt="Analytics Dashboard" />
