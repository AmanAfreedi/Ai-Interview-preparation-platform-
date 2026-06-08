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

    # Skill gap provider: crewai_amp | mock
    skill_gap_provider: SkillGapProvider = "crewai_amp"
    skill_gap_mock: bool = False

    # CrewAI AMP (Required) — deployed crew on app.crewai.com
    crewai_skill_gap_base_url: str = ""
    crewai_skill_gap_bearer_token: str = ""
    crewai_amp_poll_interval_seconds: float = 2.0
    crewai_amp_poll_timeout_seconds: float = 300.0
    crewai_amp_request_timeout_seconds: float = 60.0

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "https://stalwart-macaron-915ce6.netlify.app"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def crewai_amp_configured(self) -> bool:
        return bool(self.crewai_skill_gap_base_url.strip() and self.crewai_skill_gap_bearer_token.strip())

    def resolved_skill_gap_provider(self) -> SkillGapProvider:
        if self.skill_gap_mock or self.skill_gap_provider == "mock":
            return "mock"
        return "crewai_amp"


@lru_cache
def get_settings() -> Settings:
    return Settings()
