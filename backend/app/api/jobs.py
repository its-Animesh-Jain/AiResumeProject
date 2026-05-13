from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Job, Resume, UserRole
from app.schemas.schemas import JobResponse, JobCreate
from app.api.deps import get_current_user
from app.services.ai_service import AIService

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    jobs = db.query(Job).all()
    
    # If student, calculate match percentage
    if current_user.role == UserRole.STUDENT:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
        if resume:
            for job in jobs:
                match_res = AIService.calculate_match(resume.extracted_text, job.description, job.required_skills)
                job.match_percentage = match_res["match_score"]
            # Sort by match percentage
            jobs.sort(key=lambda x: getattr(x, 'match_percentage', 0), reverse=True)
            
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
