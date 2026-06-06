from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.skill_gap import router as skill_gap_router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="AI Study Platform API",
    description="FastAPI backend for CrewAI-powered interview preparation features.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(skill_gap_router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
