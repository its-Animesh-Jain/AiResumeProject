from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.models import Job, Resume, UserRole
from app.schemas.schemas import JobResponse, JobCreate
from app.api.deps import get_current_user
from app.services.ai_service import AIService
from app.services.adzuna_service import fetch_adzuna_jobs
from beanie import PydanticObjectId

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
async def get_jobs(current_user = Depends(get_current_user)):
    # 1. Fetch local jobs
    local_jobs = await Job.find_all().to_list()
    
    # 2. Universal Search Logic
    search_queries = ["software engineer"] # Default
    resume_data = None
    
    if current_user.role == UserRole.STUDENT:
        resume = await Resume.find_one(Resume.user_id == current_user.id)
        if resume:
            if "search_queries" in resume.extracted_data:
                search_queries = resume.extracted_data["search_queries"]
            
            # Prepare data for universal matching
            resume_data = {
                "full_text": resume.extracted_text,
                "domain": resume.extracted_data.get("domain", "general"),
                "skills": resume.extracted_data.get("skills", []),
                "search_queries": search_queries
            }
    
    # 3. Fetch Adzuna jobs using multiple queries if needed
    all_adzuna_jobs = []
    # Use up to 2 top queries to get a diverse but relevant set
    for query in search_queries[:2]:
        jobs = await fetch_adzuna_jobs(query=query, count=15)
        all_adzuna_jobs.extend(jobs)
    
    # Remove duplicates from Adzuna (based on title + company)
    seen_jobs = set()
    unique_adzuna_jobs = []
    for job in all_adzuna_jobs:
        job_key = f"{job['title']}-{job['company']}"
        if job_key not in seen_jobs:
            seen_jobs.add(job_key)
            unique_adzuna_jobs.append(job)
    
    # 4. Convert local jobs to dicts and merge
    all_jobs = []
    for job in local_jobs:
        job_dict = job.dict()
        job_dict["id"] = job.id
        job_dict["hr_id"] = job.hr_id
        job_dict["source"] = "local"
        all_jobs.append(job_dict)
    
    all_jobs.extend(unique_adzuna_jobs)
    
    # 5. Calculate universal match scores if resume exists
    if resume_data:
        for job in all_jobs:
            match_res = AIService.calculate_universal_match(
                resume_data, 
                job["description"], 
                job["title"]
            )
            job["match_percentage"] = match_res["match_score"]
            job["reasons"] = match_res["reasons"] # Add matching reasons
            job["detected_domain"] = match_res["detected_domain"]
        
        # 6. Sort by match percentage
        all_jobs.sort(key=lambda x: x.get("match_percentage", 0), reverse=True)
            
    return all_jobs

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    job = await Job.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
