from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import List, Optional, Any
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    STUDENT = "student"
    HR = "hr"

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class User(Document):
    email: str = Field(unique=True)
    hashed_password: str
    role: UserRole
    full_name: Optional[str] = None

    class Settings:
        name = "users"

class Resume(Document):
    user_id: PydanticObjectId
    file_path: str
    extracted_text: str
    extracted_data: dict = Field(default_factory=dict)

    class Settings:
        name = "resumes"

class Job(Document):
    hr_id: PydanticObjectId
    title: str
    description: str
    required_skills: List[str] = Field(default_factory=list)
    experience: str
    location: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

    class Settings:
        name = "jobs"

class Application(Document):
    job_id: PydanticObjectId
    student_id: PydanticObjectId
    status: ApplicationStatus = ApplicationStatus.PENDING
    match_score: float
    match_details: dict = Field(default_factory=dict)

    class Settings:
        name = "applications"
