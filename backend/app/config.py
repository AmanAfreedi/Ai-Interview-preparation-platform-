from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

SkillGapProvider = Literal["auto", "crewai_amp", "local", "mock"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Skill gap provider: auto | crewai_amp | local | mock
    skill_gap_provider: SkillGapProvider = "auto"
    skill_gap_mock: bool = False

    # CrewAI AMP (Option B) — deployed crew on app.crewai.com
    crewai_skill_gap_base_url: str = ""
    crewai_skill_gap_bearer_token: str = ""
    crewai_amp_poll_interval_seconds: float = 2.0
    crewai_amp_poll_timeout_seconds: float = 300.0
    crewai_amp_request_timeout_seconds: float = 60.0

    # Local CrewAI (Option A fallback) — runs crew.py in this repo
    openai_api_key: str = ""
    openai_model_name: str = "gpt-4o-mini"

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def crewai_amp_configured(self) -> bool:
        return bool(self.crewai_skill_gap_base_url.strip() and self.crewai_skill_gap_bearer_token.strip())

    def resolved_skill_gap_provider(self) -> SkillGapProvider:
        if self.skill_gap_mock or self.skill_gap_provider == "mock":
            return "mock"
        if self.skill_gap_provider == "crewai_amp":
            return "crewai_amp"
        if self.skill_gap_provider == "local":
            return "local"
        # auto
        if self.crewai_amp_configured:
            return "crewai_amp"
        if self.openai_api_key.strip():
            return "local"
        return "crewai_amp"


@lru_cache
def get_settings() -> Settings:
    return Settings()
