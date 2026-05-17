import httpx
import logging
from app.services.ai_service import AIService

ADZUNA_APP_ID = "37c7418c"
ADZUNA_APP_KEY = "a87f8a7b14b4bb76ce4d5af22c15e357"
ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1"

logger = logging.getLogger(__name__)

async def fetch_adzuna_jobs(query: str = "developer", location: str = "india", count: int = 20) -> list[dict]:
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "results_per_page": count,
        "what": query,
        "content-type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(ADZUNA_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            adzuna_jobs = []
            for result in data.get("results", []):
                adzuna_id = str(result.get("id"))
                # Use a negative integer derived from Adzuna's string ID
                mapped_id = -(int(adzuna_id) % 2_000_000_000)
                
                description = result.get("description", "")
                # Truncate description to 1000 chars
                truncated_desc = (description[:997] + "...") if len(description) > 1000 else description
                
                # Extract skills using existing AIService
                required_skills = AIService.extract_skills(description)
                
                job_dict = {
                    "id": mapped_id,
                    "hr_id": 0,  # Sentinel value for external jobs
                    "title": result.get("title", "Unknown Title"),
                    "description": truncated_desc,
                    "required_skills": required_skills,
                    "experience": "Not specified",
                    "location": result.get("location", {}).get("display_name", "Unknown Location"),
                    "match_percentage": None,
                    "source": "adzuna",
                    "redirect_url": result.get("redirect_url"),
                    "company": result.get("company", {}).get("display_name", "Unknown")
                }
                adzuna_jobs.append(job_dict)
            
            return adzuna_jobs
            
    except Exception as e:
        logger.error(f"Error fetching jobs from Adzuna: {str(e)}")
        return []
