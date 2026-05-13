from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    HR = "hr"

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    full_name = Column(String)

    resumes = relationship("Resume", back_populates="owner")
    jobs_posted = relationship("Job", back_populates="hr_user")
    applications = relationship("Application", back_populates="student")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String)
    extracted_text = Column(String)
    extracted_data = Column(JSON)  # skills, experience, education

    owner = relationship("User", back_populates="resumes")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    hr_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    required_skills = Column(JSON)  # List of skills
    experience = Column(String)
    location = Column(String)
    created_at = Column(String) # For simplicity, can be DateTime

    hr_user = relationship("User", back_populates="jobs_posted")
    applications = relationship("Application", back_populates="job")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.PENDING)
    match_score = Column(Float)
    match_details = Column(JSON) # matched_skills, missing_skills

    job = relationship("Job", back_populates="applications")
    student = relationship("User", back_populates="applications")
