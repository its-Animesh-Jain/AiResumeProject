from pydantic import BaseModel, EmailStr, BeforeValidator
from typing import List, Optional, Annotated
from app.models.models import UserRole, ApplicationStatus
from beanie import PydanticObjectId

# Custom type for handling MongoDB ObjectId and Adzuna integer IDs as strings in responses
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserBase(BaseModel):
    id: Optional[PyObjectId] = None
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole

    class Config:
        from_attributes = True

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
    id: PyObjectId
    hr_id: Optional[PyObjectId] = None
    match_percentage: Optional[float] = None
    source: Optional[str] = "local"
    redirect_url: Optional[str] = None
    company: Optional[str] = None
    reasons: Optional[List[str]] = []
    detected_domain: Optional[str] = None

    class Config:
        from_attributes = True

class ResumeBase(BaseModel):
    extracted_data: Optional[dict] = None

class ResumeResponse(ResumeBase):
    id: PyObjectId
    file_path: str
    extracted_text: str

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    job_id: PyObjectId

class ApplicationResponse(BaseModel):
    id: PyObjectId
    job_id: PyObjectId
    student_id: PyObjectId
    status: ApplicationStatus
    match_score: float
    match_details: dict
    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True
