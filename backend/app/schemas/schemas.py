from pydantic import BaseModel, EmailStr, Field
from typing import Any, Dict, List, Optional
from app.models.models import UserRole, ApplicationStatus

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class JobCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=20)
    required_skills: List[str] = Field(default_factory=list)
    experience_years: int = Field(..., ge=0, le=50)
    location: str = Field(..., min_length=2)

class JobResponse(JobCreate):
    id: str
    hr_id: str
    company: Optional[str] = "Internal"
    match_percentage: Optional[float] = None
    is_external: bool = False
    external_url: Optional[str] = None
    source: Optional[str] = "internal"

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    student_id: str
    student_name: str
    status: ApplicationStatus
    match_score: float
    match_details: dict
    ai_analysis: Optional[dict] = None
    job_metadata: Optional[dict] = None
    is_external_job: bool = False
    source: str = "internal"
    job: Optional[Dict[str, Any]] = None
