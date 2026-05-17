from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List
import os
import shutil
from app.models.models import Resume, User, Job, Application, UserRole, ApplicationStatus
from app.schemas.schemas import ResumeResponse, ApplicationResponse
from app.api.deps import get_current_user
from app.services.ai_service import AIService

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-resume", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can upload resumes")
    
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text
    if file.filename.endswith(".pdf"):
        text = AIService.extract_text_from_pdf(file_path)
    elif file.filename.endswith(".docx"):
        text = AIService.extract_text_from_docx(file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    skills = AIService.extract_skills(text)
    experience = AIService.extract_experience(text)
    
    # Deep parse resume for better metadata
    deep_data = AIService.deep_parse_resume(text)
    
    extracted_data = {
        "skills": deep_data["skills"],
        "experience": deep_data["experience"],
        "degrees": deep_data["degrees"],
        "domain": deep_data["domain"],
        "search_queries": deep_data["search_queries"],
        "education": [] # Placeholder
    }
    
    # Check if resume already exists
    resume = await Resume.find_one(Resume.user_id == current_user.id)
    if resume:
        resume.file_path = file_path
        resume.extracted_text = text
        resume.extracted_data = extracted_data
        await resume.save()
    else:
        resume = Resume(
            user_id=current_user.id,
            file_path=file_path,
            extracted_text=text,
            extracted_data=extracted_data
        )
        await resume.insert()
    
    return resume

@router.get("/resume", response_model=ResumeResponse)
async def get_resume(current_user: User = Depends(get_current_user)):
    resume = await Resume.find_one(Resume.user_id == current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.post("/apply/{job_id}", response_model=ApplicationResponse)
async def apply_to_job(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply to jobs")
    
    # Check if already applied
    existing_app = await Application.find_one(
        Application.job_id == job_id,
        Application.student_id == current_user.id
    )
    if existing_app:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    job = await Job.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    resume = await Resume.find_one(Resume.user_id == current_user.id)
    if not resume:
        raise HTTPException(status_code=400, detail="Please upload a resume first")
    
    # Calculate match
    match_res = AIService.calculate_match(resume.extracted_text, job.description, job.required_skills)
    
    application = Application(
        job_id=job_id,
        student_id=current_user.id,
        match_score=match_res["match_score"],
        match_details=match_res
    )
    await application.insert()
    return application

@router.get("/applications", response_model=List[ApplicationResponse])
async def get_applications(current_user: User = Depends(get_current_user)):
    apps = await Application.find(Application.student_id == current_user.id).to_list()
    # Populate jobs manually since we're not using Link for simplicity in response
    for app in apps:
        app.job = await Job.get(app.job_id)
    return apps
