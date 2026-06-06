from fastapi import APIRouter, HTTPException

from app.clients.crewai_amp import CrewAIAmpError
from app.config import get_settings
from app.crews.skill_gap.crew import run_skill_gap_crew
from app.crews.skill_gap.mock import mock_skill_gap_analysis
from app.crews.skill_gap.remote import run_skill_gap_via_crewai_amp
from app.models.skill_gap import SkillGapAnalyzeRequest, SkillGapAnalyzeResponse

router = APIRouter(prefix="/skill-gap", tags=["skill-gap"])


@router.get("/status")
def skill_gap_service_status() -> dict[str, object]:
    """Shows which skill-gap backend is active (useful after configuring .env)."""
    settings = get_settings()
    provider = settings.resolved_skill_gap_provider()

    payload: dict[str, object] = {
        "provider": provider,
        "crewai_amp_configured": settings.crewai_amp_configured,
        "local_openai_configured": bool(settings.openai_api_key.strip()),
        "mock_mode": provider == "mock",
    }

    if provider == "crewai_amp" and settings.crewai_amp_configured:
        payload["crewai_base_url"] = settings.crewai_skill_gap_base_url.rstrip("/")
        try:
            from app.clients.crewai_amp import CrewAIAmpClient

            client = CrewAIAmpClient(
                base_url=settings.crewai_skill_gap_base_url,
                bearer_token=settings.crewai_skill_gap_bearer_token,
            )
            payload["crewai_health"] = client.health()
            payload["crewai_required_inputs"] = client.get_inputs()
        except CrewAIAmpError as exc:
            payload["crewai_health"] = f"error: {exc}"

    return payload


@router.post("/analyze", response_model=SkillGapAnalyzeResponse)
def analyze_skill_gap(body: SkillGapAnalyzeRequest) -> SkillGapAnalyzeResponse:
    settings = get_settings()
    provider = settings.resolved_skill_gap_provider()

    if provider == "mock":
        return SkillGapAnalyzeResponse(analysis=mock_skill_gap_analysis())

    resume_text = body.resume_text.strip()
    job_description = body.job_description.strip()

    try:
        if provider == "crewai_amp":
            if not settings.crewai_amp_configured:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        "CrewAI AMP is not configured. Set CREWAI_SKILL_GAP_BASE_URL and "
                        "CREWAI_SKILL_GAP_BEARER_TOKEN in backend/.env (from your crew's "
                        "Status tab on app.crewai.com)."
                    ),
                )
            analysis = run_skill_gap_via_crewai_amp(
                settings,
                resume_text=resume_text,
                job_description=job_description,
                candidate_name=body.candidate_name,
                position_title=body.position_title,
            )
        else:
            if not settings.openai_api_key.strip():
                raise HTTPException(
                    status_code=503,
                    detail=(
                        "Local CrewAI is not configured. Set OPENAI_API_KEY or switch to "
                        "SKILL_GAP_PROVIDER=crewai_amp with your AMP URL and bearer token."
                    ),
                )
            analysis = run_skill_gap_crew(
                resume_text=resume_text,
                job_description=job_description,
                candidate_name=body.candidate_name,
                position_title=body.position_title,
            )
    except CrewAIAmpError as exc:
        status = exc.status_code if exc.status_code and exc.status_code < 500 else 502
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Skill gap analysis failed. Check server logs.",
        ) from exc

    return SkillGapAnalyzeResponse(analysis=analysis)
