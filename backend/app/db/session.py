import motor.motor_asyncio
from beanie import init_beanie
from app.models.models import User, Job, Application
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/ai_resume_db")

async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
    db_name = MONGODB_URL.split("/")[-1].split("?")[0] or "ai_resume_db"
    db = client[db_name]
    await init_beanie(
        database=db,
        document_models=[User, Job, Application]
    )
