from pydantic import BaseModel, Field


class MissingSkills(BaseModel):
    critical: list[str] = Field(
        default_factory=list,
        description="Required skills not evidenced in the resume",
    )
    preferred: list[str] = Field(
        default_factory=list,
        description="Nice-to-have skills not evidenced in the resume",
    )


class SkillGapAnalysisResult(BaseModel):
    """Final structured output — matches CrewAI Skill Gap Analysis Specialist."""

    match_score: int = Field(ge=0, le=100, description="Overall fit 0–100")
    matching_skills: list[str]
    missing_skills: MissingSkills
    strengths: list[str]
    recommendations: list[str] = Field(
        description="Actionable learning steps ordered by impact",
    )
    summary: str


class SkillGapAnalyzeRequest(BaseModel):
    resume_text: str = Field(min_length=50, max_length=50_000)
    job_description: str = Field(min_length=30, max_length=30_000)
    candidate_name: str | None = Field(
        default=None,
        max_length=120,
        description="Personalizes analysis — maps to CrewAI {candidate_name}",
    )
    position_title: str | None = Field(
        default=None,
        max_length=200,
        description="Target role title — maps to CrewAI {position_title}",
    )
    resume_id: str | None = Field(
        default=None,
        description="Optional Firestore resume id for logging/analytics",
    )


class SkillGapAnalyzeResponse(BaseModel):
    analysis: SkillGapAnalysisResult
