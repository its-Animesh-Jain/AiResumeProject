# AI-Powered Resume Shortlisting and Role Recommendation System

A full-stack application that uses AI to parse resumes and match them with job descriptions based on skills and semantic similarity.

## Tech Stack
- **Frontend**: React (Vite, TypeScript, Tailwind CSS, Zustand, Lucide Icons, Framer Motion)
- **Backend**: Python (FastAPI, SQLAlchemy, PostgreSQL)
- **AI/ML**: spaCy (NER for skills), Sentence-Transformers (Semantic Matching)
- **File Handling**: PyMuPDF (PDF), python-docx (DOCX)

## Core Features
### For Students (Job Seekers)
- **AI Resume Analysis**: Upload your resume in PDF/DOCX format. Our AI automatically extracts your skills and experience.
- **Role Recommendations**: Get a list of jobs sorted by their match percentage with your profile.
- **Application Tracking**: Apply to jobs and track your status (Pending, Accepted, Rejected).
- **Match Insights**: See which skills match and which are missing for each job.

### For HR (Recruiters)
- **Job Posting**: Create job listings with specific requirements.
- **Smart Shortlisting**: View applicants ranked by their AI-calculated match score.
- **Applicant Management**: Accept or reject candidates with real-time status updates for the student.
- **Skill Gap Analysis**: Quickly see matching and missing skills for every applicant.

## Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (for PostgreSQL) or a local PostgreSQL instance

## Getting Started

### 1. Database Setup
If you have Docker installed, run:
```bash
docker-compose up -d
```
Otherwise, ensure you have a PostgreSQL database named `ai_resume_db` running on `localhost:5432` with username/password `postgres/postgres`.

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## Folder Structure
- `backend/app/`: FastAPI application code.
- `backend/app/api/`: API routes (Auth, Jobs, Student, HR).
- `backend/app/services/ai_service.py`: AI/ML logic for parsing and matching.
- `frontend/src/pages/`: React page components.
- `frontend/src/store/`: Zustand state management.
- `frontend/src/services/api.ts`: Axios API client.
