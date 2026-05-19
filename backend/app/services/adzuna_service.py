import httpx
import logging
import re
from app.services.ai_service import AIService
from typing import List, Dict

ADZUNA_APP_ID = "37c7418c"
ADZUNA_APP_KEY = "a87f8a7b14b4bb76ce4d5af22c15e357"
ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1"

logger = logging.getLogger(__name__)

class AdzunaService:
    @staticmethod
    async def fetch_jobs(query: str = "jobs", country: str = "in", count: int = 15) -> List[Dict]:
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "results_per_page": count,
            "what": query,
            "content-type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
                logger.info(f"Fetching Adzuna jobs: {url} with query '{query}'")
                response = await client.get(url, params=params)
                
                if response.status_code != 200:
                    logger.error(f"Adzuna API Error: {response.status_code} - {response.text}")
                    return []
                
                data = response.json()
                logger.info(f"Adzuna returned {len(data.get('results', []))} jobs")
                
                adzuna_jobs = []
                for result in data.get("results", []):
                    # Clean the title and description (remove HTML tags if any)
                    title = re.sub('<[^<]+?>', '', result.get("title", "Unknown Role"))
                    description = re.sub('<[^<]+?>', '', result.get("description", ""))
                    
                    # FIX: Use consistent string ID for external jobs
                    adzuna_id = str(result.get("id"))
                    mapped_id = f"ext_adzuna_{adzuna_id}"
                    
                    # Extract skills using the analyze_resume
                    analysis = AIService.analyze_resume(description)
                    
                    # Ensure required_skills is at least an empty list if analysis fails
                    req_skills = analysis.get("skills", []) if analysis else []
                    
                    # Extract company name
                    company = result.get("company", {}).get("display_name", "Unknown Company")
                    
                    job_dict = {
                        "id": mapped_id,
                        "hr_id": "external",
                        "title": title,
                        "company": company,
                        "description": description,
                        "required_skills": req_skills,
                        "experience_years": analysis.get("experience", 0) if analysis else 0,
                        "location": result.get("location", {}).get("display_name", "Remote"),
                        "is_external": True,
                        "external_url": result.get("redirect_url"),
                        "match_percentage": None,
                        "source": "adzuna"
                    }
                    adzuna_jobs.append(job_dict)
                
                return adzuna_jobs
                
        except Exception as e:
            logger.error(f"Error fetching Adzuna jobs: {str(e)}")
            return []
