from pydantic import BaseModel, Field


class RoadmapRequest(BaseModel):
    skills: str = Field(
        min_length=2,
        max_length=2_000,
        description="Comma-separated list of skills to learn",
    )
    days: str = Field(
        min_length=1,
        max_length=5,
        pattern=r"^\d+$",
        description="Number of days available as a string e.g. '30'",
    )


class RoadmapResponse(BaseModel):
    roadmap_markdown: str = Field(
        description="Full markdown roadmap document returned by the CrewAI agent",
    )
