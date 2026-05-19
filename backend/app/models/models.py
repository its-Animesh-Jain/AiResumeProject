from typing import List, Optional
from datetime import datetime
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    HR = "hr"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class ResumeData(BaseModel):
    skills: List[str] = []
    experience: int = 0
    education: List[str] = []
    detected_domain: Optional[str] = None
    extracted_text: Optional[str] = None

class User(Document):
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    full_name: str
    role: UserRole
    resume: Optional[ResumeData] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

class Job(Document):
    hr_id: str
    title: str
    description: str
    required_skills: List[str]
    experience_years: int
    location: str
    is_external: bool = False
    external_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "jobs"

class Application(Document):
    job_id: str
    student_id: str
    student_name: str
    status: ApplicationStatus = ApplicationStatus.PENDING
    match_score: float
    match_details: dict
    ai_analysis: Optional[dict] = None
    job_metadata: Optional[dict] = None  # Stores title, company, description if external
    is_external_job: bool = False
    source: str = "internal"  # "internal" or "adzuna"
    applied_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "applications"
