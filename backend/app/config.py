from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

SkillGapProvider = Literal["crewai_amp", "mock"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Skill Gap ────────────────────────────────────────────────────────────
    skill_gap_provider: SkillGapProvider = "crewai_amp"
    skill_gap_mock: bool = False

    crewai_skill_gap_base_url: str = ""
    crewai_skill_gap_bearer_token: str = ""

    # ── Roadmap ──────────────────────────────────────────────────────────────
    roadmap_mock: bool = False

    crewai_roadmap_base_url: str = ""
    crewai_roadmap_bearer_token: str = ""

    # ── Shared AMP polling/timeout config ────────────────────────────────────
    crewai_amp_poll_interval_seconds: float = 3.0
    crewai_amp_poll_timeout_seconds: float = 360.0
    crewai_amp_request_timeout_seconds: float = 120.0

    # ── Local crew fallback via OpenAI (optional) ────────────────────────────
    openai_api_key: str = ""
    openai_model_name: str = "gpt-4o-mini"

    # ── Server ───────────────────────────────────────────────────────────────
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "https://stalwart-macaron-915ce6.netlify.app"
    )

    # ── Computed properties ──────────────────────────────────────────────────

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def crewai_amp_configured(self) -> bool:
        return bool(self.crewai_skill_gap_base_url.strip() and self.crewai_skill_gap_bearer_token.strip())

    @property
    def crewai_roadmap_configured(self) -> bool:
        return bool(self.crewai_roadmap_base_url.strip() and self.crewai_roadmap_bearer_token.strip())

    def resolved_skill_gap_provider(self) -> SkillGapProvider:
        if self.skill_gap_mock or self.skill_gap_provider == "mock":
            return "mock"
        return "crewai_amp"


@lru_cache
def get_settings() -> Settings:
    return Settings()
