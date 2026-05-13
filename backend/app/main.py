from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, jobs, student, hr
from app.db.session import engine, Base

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Powered Resume Shortlisting")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(student.router, prefix="/student", tags=["student"])
app.include_router(hr.router, prefix="/hr", tags=["hr"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI-Powered Resume Shortlisting API"}
