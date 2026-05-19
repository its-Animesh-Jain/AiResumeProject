from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, jobs, student, hr
from app.db.session import init_db
import uvicorn

app = FastAPI(title="AI-Powered Resume ATS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(student.router, prefix="/student", tags=["student"])
app.include_router(hr.router, prefix="/hr", tags=["hr"])

@app.get("/")
async def root():
    return {"message": "AI Resume ATS API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
