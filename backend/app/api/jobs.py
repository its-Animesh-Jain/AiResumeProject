from fastapi import APIRouter, Depends
from typing import List
import logging
from app.models.models import Job, User, UserRole
from app.schemas.schemas import JobResponse
from app.api.deps import get_current_user
from app.services.adzuna_service import AdzunaService
from app.services.ai_service import AIService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[JobResponse])
async def get_jobs(current_user: User = Depends(get_current_user)):
    # 1. Fetch internal jobs
    internal_jobs = await Job.find_all().to_list()
    results = [{**j.dict(), "id": str(j.id), "company": "Internal", "source": "internal"} for j in internal_jobs]
    
    # 2. Fetch external jobs based on user profile
    search_query = "jobs"
    country = "in" # Default to India as per project context
    if current_user.role == UserRole.STUDENT and current_user.resume:
        # Use detected domain and top skills to build a better query
        domain = current_user.resume.detected_domain
        skills = current_user.resume.skills[:2]
        
        # Log parsing results for debugging
        logger.info(f"User Resume Analysis - Domain: {domain}, Skills: {skills}")
        
        if domain and domain != "general":
            search_query = f"{domain} {' '.join(skills)}"
        elif skills:
            search_query = " ".join(skills)

    try:
        logger.info(f"Final Adzuna Query: {search_query}")
        external_jobs = await AdzunaService.fetch_jobs(search_query, country, count=25)
        
        # Filter out duplicates (based on title and company) if they already exist in results
        existing_titles = {r["title"].lower() for r in results}
        for ext_job in external_jobs:
            if ext_job["title"].lower() not in existing_titles:
                results.append(ext_job)
                
    except Exception as e:
        logger.error(f"Failed to fetch Adzuna jobs: {str(e)}")
    
    # 3. If student, calculate real-time match scores
    if current_user.role == UserRole.STUDENT and current_user.resume:
        for job in results:
            match = AIService.calculate_match(
                current_user.resume.extracted_text,
                job["description"],
                job["required_skills"]
            )
            job["match_percentage"] = match["match_score"]
            
            # Log individual job scores if very low for debugging
            if match["match_score"] < 10:
                logger.warning(f"Low match score ({match['match_score']}%) for job: {job['title']}")
        
        # Sort by match percentage - prioritize internal jobs for equal scores
        results.sort(key=lambda x: (x.get("match_percentage", 0), not x.get("is_external", False)), reverse=True)
        
    return results
