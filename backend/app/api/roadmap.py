from fastapi import APIRouter, HTTPException

from app.clients.crewai_amp import CrewAIAmpClient, CrewAIAmpError
from app.config import get_settings
from app.crews.roadmap.mock import mock_roadmap
from app.crews.roadmap.remote import run_roadmap_via_crewai_amp
from app.models.roadmap import RoadmapRequest, RoadmapResponse

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


def _get_amp_client():
    settings = get_settings()
    return CrewAIAmpClient(
        base_url=settings.crewai_roadmap_base_url,
        bearer_token=settings.crewai_roadmap_bearer_token,
        timeout_seconds=settings.crewai_amp_request_timeout_seconds,
    )


@router.get("/status")
def roadmap_service_status() -> dict[str, object]:
    """Shows roadmap backend configuration status."""
    settings = get_settings()

    payload: dict[str, object] = {
        "crewai_amp_configured": settings.crewai_roadmap_configured,
        "mock_mode": settings.roadmap_mock,
    }

    if settings.crewai_roadmap_configured:
        payload["crewai_base_url"] = settings.crewai_roadmap_base_url.rstrip("/")
        try:
            client = _get_amp_client()
            payload["crewai_health"] = client.health()
            payload["crewai_required_inputs"] = client.get_inputs()
        except CrewAIAmpError as exc:
            payload["crewai_health"] = f"error: {exc}"

    return payload


@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(body: RoadmapRequest) -> RoadmapResponse:
    settings = get_settings()

    # Mock mode — instant response for dev/testing
    if settings.roadmap_mock:
        return RoadmapResponse(
            roadmap_markdown=mock_roadmap(skills=body.skills, days=body.days)
        )

    if not settings.crewai_roadmap_configured:
        raise HTTPException(
            status_code=503,
            detail=(
                "Roadmap backend is not configured. "
                "Set CREWAI_ROADMAP_BASE_URL and CREWAI_ROADMAP_BEARER_TOKEN in backend/.env"
            ),
        )

    try:
        markdown = run_roadmap_via_crewai_amp(
            settings,
            skills=body.skills,
            days=body.days,
        )
    except CrewAIAmpError as exc:
        status = exc.status_code if exc.status_code and exc.status_code < 500 else 502
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Roadmap generation failed: {type(exc).__name__}: {exc}",
        ) from exc

    return RoadmapResponse(roadmap_markdown=markdown)
