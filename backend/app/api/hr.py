from fastapi import APIRouter, Depends, HTTPException
from typing import List
from beanie.operators import In
from app.models.models import Job, Application, User, UserRole
from app.schemas.schemas import JobCreate, JobResponse, ApplicationResponse, ApplicationStatusUpdate
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/jobs", response_model=JobResponse)
async def create_job(job_in: JobCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.HR:
        raise HTTPException(status_code=403, detail="Only HR can post jobs")
    
    job = Job(
        hr_id=str(current_user.id),
        **job_in.dict()
    )
    await job.insert()
    return {**job.dict(), "id": str(job.id)}

@router.get("/jobs", response_model=List[JobResponse])
async def get_my_jobs(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.HR:
        raise HTTPException(status_code=403, detail="Only HR can view their jobs")
    jobs = await Job.find(Job.hr_id == str(current_user.id)).to_list()
    return [{**j.dict(), "id": str(j.id)} for j in jobs]

@router.get("/jobs/{job_id}/applicants", response_model=List[ApplicationResponse])
async def get_job_applicants(job_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.HR:
        raise HTTPException(status_code=403, detail="Only HR can view applicants")
    
    # For internal jobs, verify ownership
    internal_job = await Job.get(job_id)
    if internal_job and internal_job.hr_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Fetch applications for this job (internal or external)
    apps = await Application.find(Application.job_id == job_id).to_list()
    
    results = []
    for app in apps:
        job_info = None
        if not app.is_external_job:
            if internal_job:
                job_info = {**internal_job.dict(), "id": str(internal_job.id)}
        else:
            job_info = {
                "id": app.job_id,
                "hr_id": "external",
                "title": app.job_metadata.get("title", "Unknown Role"),
                "description": app.job_metadata.get("description", ""),
                "required_skills": app.job_metadata.get("required_skills", []),
                "experience_years": 0,
                "location": app.job_metadata.get("location", "Remote"),
                "is_external": True,
                "external_url": app.job_metadata.get("external_url")
            }

        results.append({
            **app.dict(),
            "id": str(app.id),
            "job": job_info
        })
    return results

@router.get("/applicants/all", response_model=List[ApplicationResponse])
async def get_all_applicants(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.HR:
        raise HTTPException(status_code=403, detail="Only HR can access talent pool")
    
    # 1. Fetch internal job applications (only for jobs posted by THIS HR)
    my_jobs = await Job.find(Job.hr_id == str(current_user.id)).to_list()
    job_ids = [str(j.id) for j in my_jobs]
    internal_apps = await Application.find(
        In(Application.job_id, job_ids),
        Application.is_external_job == False
    ).to_list()
    
    # 2. Fetch external job applications (Show ALL external applications to ALL HRs for demo purposes)
    external_apps = await Application.find(Application.is_external_job == True).to_list()
    
    apps = internal_apps + external_apps
    
    # Sort apps by applied_at descending
    apps.sort(key=lambda x: x.applied_at, reverse=True)
    
    results = []
    for app in apps:
        job_info = None
        if not app.is_external_job:
            job = next((j for j in my_jobs if str(j.id) == app.job_id), None)
            if job:
                job_info = {**job.dict(), "id": str(job.id)}
        else:
            # Map external metadata to JobResponse schema format
            job_info = {
                "id": app.job_id,
                "hr_id": "external",
                "title": app.job_metadata.get("title", "Unknown Role"),
                "description": app.job_metadata.get("description", ""),
                "required_skills": app.job_metadata.get("required_skills", []),
                "experience_years": 0,
                "location": app.job_metadata.get("location", "Remote"),
                "is_external": True,
                "external_url": app.job_metadata.get("external_url")
            }
        
        results.append({
            **app.dict(),
            "id": str(app.id),
            "job": job_info
        })
    return results

@router.post("/applications/{application_id}/status", response_model=ApplicationResponse)
async def update_status(
    application_id: str, 
    status_in: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user)
):
    app = await Application.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if not app.is_external_job:
        job = await Job.get(app.job_id)
        if not job or job.hr_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Unauthorized")
    
    app.status = status_in.status
    await app.save()
    return {**app.dict(), "id": str(app.id)}
