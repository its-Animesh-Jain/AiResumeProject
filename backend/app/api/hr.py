from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Job, Application, User, UserRole, ApplicationStatus
from app.schemas.schemas import JobCreate, JobResponse, ApplicationResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/jobs", response_model=JobResponse)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.HR:
        raise HTTPException(status_code=403, detail="Only HR can post jobs")
    
    job = Job(
        hr_id=current_user.id,
        **job_in.dict()
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/jobs", response_model=List[JobResponse])
def get_my_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.HR:
        raise HTTPException(status_code=403, detail="Only HR can view their jobs")
    return db.query(Job).filter(Job.hr_id == current_user.id).all()

@router.get("/jobs/{job_id}/applicants", response_model=List[ApplicationResponse])
def get_applicants(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id, Job.hr_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    return db.query(Application).filter(Application.job_id == job_id).all()

@router.post("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    status: ApplicationStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(Application).join(Job).filter(
        Application.id == application_id,
        Job.hr_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found or unauthorized")
    
    application.status = status
    db.commit()
    return {"message": f"Application status updated to {status}"}
