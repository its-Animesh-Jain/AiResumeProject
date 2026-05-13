from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.models.models import UserRole, ApplicationStatus

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserBase

class JobBase(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    experience: str
    location: str

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    hr_id: int
    match_percentage: Optional[float] = None # Added for matching recommendations

    class Config:
        from_attributes = True

class ResumeBase(BaseModel):
    extracted_data: Optional[dict] = None

class ResumeResponse(ResumeBase):
    id: int
    file_path: str
    extracted_text: str

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    job_id: int

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    student_id: int
    status: ApplicationStatus
    match_score: float
    match_details: dict
    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True
