from app.clients.crewai_amp import CrewAIAmpClient, CrewAIAmpError
from app.config import Settings
from app.crews.skill_gap.parse_output import parse_skill_gap_output
from app.models.skill_gap import SkillGapAnalysisResult


def _build_crew_inputs(
    *,
    resume_text: str,
    job_description: str,
    candidate_name: str | None,
    position_title: str | None,
    required_inputs: list[str] | None = None,
) -> dict[str, str]:
    """Map API fields to CrewAI AMP input variable names."""
    values = {
        "candidate_name": (candidate_name or "").strip() or "Candidate",
        "position_title": (position_title or "").strip() or "Target Role",
        "resume_text": resume_text.strip(),
        "job_description": job_description.strip(),
        # Common aliases some crews use instead
        "resume": resume_text.strip(),
        "job_description_text": job_description.strip(),
        "jd": job_description.strip(),
    }

    if required_inputs:
        missing = [key for key in required_inputs if key not in values]
        if missing:
            raise ValueError(
                "CrewAI crew expects inputs your API did not map: "
                + ", ".join(missing)
                + ". Share the /inputs list to add mappings."
            )
        inputs = {key: values[key] for key in required_inputs}
    else:
        inputs = {
            "candidate_name": values["candidate_name"],
            "position_title": values["position_title"],
        }

    # AMP /inputs may only list personalization fields; tasks still need resume + JD.
    for key in ("resume_text", "job_description"):
        if values[key]:
            inputs[key] = values[key]

    return inputs


def run_skill_gap_via_crewai_amp(
    settings: Settings,
    *,
    resume_text: str,
    job_description: str,
    candidate_name: str | None = None,
    position_title: str | None = None,
) -> SkillGapAnalysisResult:
    if not settings.crewai_skill_gap_base_url or not settings.crewai_skill_gap_bearer_token:
        raise CrewAIAmpError(
            "CrewAI AMP is not configured. Set CREWAI_SKILL_GAP_BASE_URL and "
            "CREWAI_SKILL_GAP_BEARER_TOKEN in backend/.env"
        )

    client = CrewAIAmpClient(
        base_url=settings.crewai_skill_gap_base_url,
        bearer_token=settings.crewai_skill_gap_bearer_token,
        timeout_seconds=settings.crewai_amp_request_timeout_seconds,
    )

    required_inputs = client.get_inputs()
    inputs = _build_crew_inputs(
        resume_text=resume_text,
        job_description=job_description,
        candidate_name=candidate_name,
        position_title=position_title,
        required_inputs=required_inputs,
    )

    raw_output = client.run_and_wait(
        inputs,
        poll_interval_seconds=settings.crewai_amp_poll_interval_seconds,
        poll_timeout_seconds=settings.crewai_amp_poll_timeout_seconds,
    )

    return parse_skill_gap_output(raw_output)
