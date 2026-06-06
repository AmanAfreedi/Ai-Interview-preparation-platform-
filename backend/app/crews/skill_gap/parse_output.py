import json
import re

from app.models.skill_gap import SkillGapAnalysisResult


def _strip_markdown_fence(text: str) -> str:
    stripped = text.strip()
    if not stripped.startswith("```"):
        return stripped

    lines = stripped.splitlines()
    if len(lines) < 2:
        return stripped

    end_index = len(lines) - 1
    if lines[end_index].strip() == "```":
        return "\n".join(lines[1:end_index]).strip()

    return "\n".join(lines[1:]).strip()


def parse_skill_gap_output(raw_output: str) -> SkillGapAnalysisResult:
    text = _strip_markdown_fence(raw_output)

    try:
        payload = json.loads(text)
    except json.JSONDecodeError as exc:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise ValueError(
                "CrewAI output is not valid JSON. Check the final task schema on AMP."
            ) from exc
        try:
            payload = json.loads(match.group(0))
        except json.JSONDecodeError as inner_exc:
            raise ValueError(
                "CrewAI output is not valid JSON. Check the final task schema on AMP."
            ) from inner_exc

    if not isinstance(payload, dict):
        raise ValueError("CrewAI output must be a JSON object.")

    return SkillGapAnalysisResult.model_validate(payload)
