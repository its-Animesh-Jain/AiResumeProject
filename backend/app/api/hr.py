from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.models import Job, Application, User, UserRole, ApplicationStatus
from app.schemas.schemas import JobCreate, JobResponse, ApplicationResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/jobs", response_model=JobResponse)
async def create_job(
    job_in: JobCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.HR:
        raise HTTPException(status_code=403, detail="Only HR can post jobs")
    
    job = Job(
        hr_id=current_user.id,
        **job_in.dict()
    )
    await job.insert()
    return job

@router.get("/jobs", response_model=List[JobResponse])
async def get_my_jobs(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.HR:
        raise HTTPException(status_code=403, detail="Only HR can view their jobs")
    return await Job.find(Job.hr_id == current_user.id).to_list()

@router.get("/jobs/{job_id}/applicants", response_model=List[ApplicationResponse])
async def get_applicants(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    job = await Job.get(job_id)
    if not job or job.hr_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    return await Application.find(Application.job_id == job_id).to_list()

@router.post("/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status: ApplicationStatus,
    current_user: User = Depends(get_current_user)
):
    application = await Application.get(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    job = await Job.get(application.job_id)
    if not job or job.hr_id != current_user.id:
        raise HTTPException(status_code=404, detail="Unauthorized")
    
    application.status = status
    await application.save()
    return {"message": f"Application status updated to {status}"}
