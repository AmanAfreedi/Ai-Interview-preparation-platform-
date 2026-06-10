from app.clients.crewai_amp import CrewAIAmpClient, CrewAIAmpError
from app.config import Settings


def run_roadmap_via_crewai_amp(
    settings: Settings,
    *,
    skills: str,
    days: str,
) -> str:
    """
    Calls the Personal Learning Roadmap Generator crew on CrewAI AMP.

    Crew inputs:  { "skills": "...", "days": "..." }
    Crew output:  raw markdown string
    """
    if not settings.crewai_roadmap_base_url or not settings.crewai_roadmap_bearer_token:
        raise CrewAIAmpError(
            "Roadmap CrewAI AMP is not configured. Set CREWAI_ROADMAP_BASE_URL and "
            "CREWAI_ROADMAP_BEARER_TOKEN in backend/.env"
        )

    client = CrewAIAmpClient(
        base_url=settings.crewai_roadmap_base_url,
        bearer_token=settings.crewai_roadmap_bearer_token,
        timeout_seconds=settings.crewai_amp_request_timeout_seconds,
    )

    raw_output = client.run_and_wait(
        {"skills": skills.strip(), "days": days.strip()},
        poll_interval_seconds=settings.crewai_amp_poll_interval_seconds,
        poll_timeout_seconds=settings.crewai_amp_poll_timeout_seconds,
    )

    if not raw_output or not raw_output.strip():
        raise CrewAIAmpError("Roadmap crew returned empty output.")

    return raw_output.strip()
