from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.models import User, Resume, Job, Application
from app.core.config import settings

async def init_db():
    # Approach 1: Pass the connection string directly to Beanie.
    # Beanie will use the built-in PyMongo 4.9+ async support.
    # This often avoids compatibility issues with Motor's __call__ behavior.
    await init_beanie(
        connection_string=settings.DATABASE_URL,
        document_models=[User, Resume, Job, Application]
    )
