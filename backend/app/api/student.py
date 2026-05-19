from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List
import os
import shutil
from app.models.models import User, Job, Application, UserRole, ResumeData
from app.schemas.schemas import ApplicationResponse
from app.api.deps import get_current_user
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can upload resumes")
    
    os.makedirs("uploads/resumes", exist_ok=True)
    file_path = f"uploads/resumes/{current_user.id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    if file.filename.endswith(".pdf"):
        text = AIService.extract_text_from_pdf(file_path)
    elif file.filename.endswith(".docx"):
        text = AIService.extract_text_from_docx(file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")
    
    analysis = AIService.analyze_resume(text)
    
    current_user.resume = ResumeData(
        skills=analysis["skills"],
        experience=analysis["experience"],
        detected_domain=analysis["domain"],
        extracted_text=text
    )
    await current_user.save()
    
    return {"message": "Resume uploaded and analyzed", "data": analysis}

@router.post("/apply/{job_id}", response_model=ApplicationResponse)
async def apply(job_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply")
    
    if not current_user.resume:
        raise HTTPException(status_code=400, detail="Please upload resume first")
    
    # Check if already applied
    existing_app = await Application.find_one(
        Application.job_id == job_id, 
        Application.student_id == str(current_user.id)
    )
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # Handle internal vs external job application
    is_external = job_id.startswith("ext_")
    job_metadata = None
    source = "internal"
    
    if is_external:
        # For external jobs, we need to fetch the job details from Adzuna again or pass them in request
        # For now, we'll try to find it in the current session's recommendations if we had a cache, 
        # but since we don't, we'll allow a simplified application that stores metadata.
        # Ideally, the frontend should pass the job details if it's external.
        # But for this redesign, let's assume we might need a separate endpoint or body for external jobs.
        # However, to keep it simple and follow the instruction, we'll modify the logic to accept a body.
        raise HTTPException(status_code=400, detail="External jobs require metadata. Use /apply-external endpoint.")

    job = await Job.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    match_res = AIService.calculate_match(
        current_user.resume.extracted_text, 
        job.description, 
        job.required_skills
    )
    
    app = Application(
        job_id=job_id,
        student_id=str(current_user.id),
        student_name=current_user.full_name,
        match_score=match_res["match_score"],
        match_details=match_res,
        is_external_job=False,
        source="internal",
        ai_analysis={
            "detected_domain": current_user.resume.detected_domain,
            "top_skills": current_user.resume.skills[:5]
        }
    )
    await app.insert()
    return {**app.dict(), "id": str(app.id)}

@router.post("/apply-external", response_model=ApplicationResponse)
async def apply_external(job_data: dict, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply")
    
    if not current_user.resume:
        raise HTTPException(status_code=400, detail="Please upload resume first")
    
    job_id = job_data.get("id")
    if not job_id:
        raise HTTPException(status_code=400, detail="Job ID required")

    existing_app = await Application.find_one(
        Application.job_id == job_id, 
        Application.student_id == str(current_user.id)
    )
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # Calculate match score for the external job
    match_res = AIService.calculate_match(
        current_user.resume.extracted_text, 
        job_data.get("description", ""), 
        job_data.get("required_skills", [])
    )
    
    app = Application(
        job_id=job_id,
        student_id=str(current_user.id),
        student_name=current_user.full_name,
        match_score=match_res["match_score"],
        match_details=match_res,
        is_external_job=True,
        source=job_data.get("source", "external"),
        job_metadata={
            "id": job_id,
            "hr_id": "external",
            "title": job_data.get("title", "Unknown Role"),
            "company": job_data.get("company", "External Source"),
            "location": job_data.get("location", "Remote"),
            "description": job_data.get("description", ""),
            "external_url": job_data.get("external_url"),
            "required_skills": job_data.get("required_skills", []),
            "experience_years": job_data.get("experience_years", 0),
            "is_external": True,
            "source": job_data.get("source", "external")
        },
        ai_analysis={
            "detected_domain": current_user.resume.detected_domain,
            "top_skills": current_user.resume.skills[:5]
        }
    )
    await app.insert()
    return {**app.dict(), "id": str(app.id)}

@router.get("/applications", response_model=List[ApplicationResponse])
async def get_my_apps(current_user: User = Depends(get_current_user)):
    apps = await Application.find(Application.student_id == str(current_user.id)).sort("-applied_at").to_list()
    results = []
    for app in apps:
        job_data = None
        if not app.is_external_job:
            job = await Job.get(app.job_id)
            if job:
                job_data = {**job.dict(), "id": str(job.id)}
        else:
            # For external jobs, prefer the stored metadata (may vary by historical records)
            job_data = app.job_metadata or {}
        
        results.append({
            **app.dict(),
            "id": str(app.id),
            "job": job_data
        })
    return results
