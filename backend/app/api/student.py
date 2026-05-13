from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from app.db.session import get_db
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
    db: Session = Depends(get_db),
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
    
    extracted_data = {
        "skills": skills,
        "experience": experience,
        "education": [] # Placeholder
    }
    
    # Check if resume already exists
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    if resume:
        resume.file_path = file_path
        resume.extracted_text = text
        resume.extracted_data = extracted_data
    else:
        resume = Resume(
            user_id=current_user.id,
            file_path=file_path,
            extracted_text=text,
            extracted_data=extracted_data
        )
        db.add(resume)
    
    db.commit()
    db.refresh(resume)
    return resume

@router.get("/resume", response_model=ResumeResponse)
def get_resume(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.post("/apply/{job_id}", response_model=ApplicationResponse)
def apply_to_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply to jobs")
    
    # Check if already applied
    existing_app = db.query(Application).filter(
        Application.job_id == job_id,
        Application.student_id == current_user.id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    job = db.query(Job).filter(Job.id == job_id).first()
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    
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
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("/applications", response_model=List[ApplicationResponse])
def get_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Application).filter(Application.student_id == current_user.id).all()
