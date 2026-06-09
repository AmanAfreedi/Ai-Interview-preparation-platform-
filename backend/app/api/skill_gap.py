from fastapi import APIRouter, HTTPException

from app.clients.crewai_amp import CrewAIAmpClient, CrewAIAmpError
from app.config import get_settings
from app.crews.skill_gap.amp_inputs import (
    AMP_MISSING_INPUTS_MESSAGE,
    amp_has_resume_and_jd,
)
from app.crews.skill_gap.crew import run_skill_gap_crew
from app.crews.skill_gap.mock import mock_skill_gap_analysis
from app.crews.skill_gap.remote import run_skill_gap_via_crewai_amp
from app.crews.skill_gap.validate import (
    PLACEHOLDER_ERROR_MESSAGE,
    is_placeholder_analysis,
)
from app.models.skill_gap import SkillGapAnalyzeRequest, SkillGapAnalyzeResponse

router = APIRouter(prefix="/skill-gap", tags=["skill-gap"])


def _get_amp_client():
    settings = get_settings()
    return CrewAIAmpClient(
        base_url=settings.crewai_skill_gap_base_url,
        bearer_token=settings.crewai_skill_gap_bearer_token,
        timeout_seconds=settings.crewai_amp_request_timeout_seconds,
    )


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

    if settings.crewai_amp_configured:
        payload["crewai_base_url"] = settings.crewai_skill_gap_base_url.rstrip("/")
        try:
            client = _get_amp_client()
            payload["crewai_health"] = client.health()
            required_inputs = client.get_inputs()
            payload["crewai_required_inputs"] = required_inputs
            payload["amp_inputs_ready"] = amp_has_resume_and_jd(required_inputs)
            if not payload["amp_inputs_ready"]:
                payload["amp_configuration_warning"] = AMP_MISSING_INPUTS_MESSAGE
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
        analysis = _run_analysis(
            settings,
            provider=provider,
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

    if is_placeholder_analysis(analysis):
        raise HTTPException(status_code=502, detail=PLACEHOLDER_ERROR_MESSAGE)

    return SkillGapAnalyzeResponse(analysis=analysis)


def _run_analysis(
    settings,
    *,
    provider: str,
    resume_text: str,
    job_description: str,
    candidate_name: str | None,
    position_title: str | None,
):
    use_amp = provider == "crewai_amp" and settings.crewai_amp_configured
    has_openai = bool(settings.openai_api_key.strip())

    if use_amp:
        client = _get_amp_client()
        required_inputs = client.get_inputs()

        if amp_has_resume_and_jd(required_inputs):
            return run_skill_gap_via_crewai_amp(
                settings,
                resume_text=resume_text,
                job_description=job_description,
                candidate_name=candidate_name,
                position_title=position_title,
            )

        if has_openai:
            return run_skill_gap_crew(
                resume_text=resume_text,
                job_description=job_description,
                candidate_name=candidate_name,
                position_title=position_title,
            )

        raise HTTPException(status_code=503, detail=AMP_MISSING_INPUTS_MESSAGE)

    if provider == "local" or has_openai:
        return run_skill_gap_crew(
            resume_text=resume_text,
            job_description=job_description,
            candidate_name=candidate_name,
            position_title=position_title,
        )

    if settings.crewai_amp_configured:
        raise HTTPException(status_code=503, detail=AMP_MISSING_INPUTS_MESSAGE)

    raise HTTPException(
        status_code=503,
        detail=(
            "No skill-gap backend is configured. Set CrewAI AMP credentials or "
            "OPENAI_API_KEY on the server."
        ),
    )
