import json
import os

from crewai import Agent, Crew, Process, Task

from app.config import get_settings
from app.models.skill_gap import SkillGapAnalysisResult


def _llm_model() -> str:
    settings = get_settings()
    if settings.openai_api_key:
        os.environ.setdefault("OPENAI_API_KEY", settings.openai_api_key)
    return settings.openai_model_name


def _default_candidate_name(name: str | None) -> str:
    return (name or "").strip() or "Candidate"


def _default_position_title(title: str | None) -> str:
    return (title or "").strip() or "Target Role"


def create_skill_gap_crew() -> Crew:
    model = _llm_model()

    resume_extractor = Agent(
        role="Resume Skills Extractor",
        goal=(
            "Conservatively extract only skills, tools, and qualifications that are "
            "explicitly mentioned in the resume for {candidate_name}."
        ),
        backstory=(
            "You are a meticulous resume reviewer. You never infer or invent skills — "
            "if it is not clearly stated in the resume text, it does not count."
        ),
        verbose=True,
        allow_delegation=False,
        llm=model,
    )

    requirements_analyzer = Agent(
        role="Job Requirements Analyzer",
        goal=(
            "Systematically identify required vs preferred qualifications for the "
            "{position_title} role from the job description."
        ),
        backstory=(
            "You parse hiring posts for engineering roles. You separate must-have "
            "requirements from nice-to-have preferences with precision."
        ),
        verbose=True,
        allow_delegation=False,
        llm=model,
    )

    gap_specialist = Agent(
        role="Skill Gap Analysis Specialist",
        goal=(
            "Compare resume skills vs job requirements for {candidate_name} applying to "
            "{position_title}. Produce honest, actionable gap analysis as structured JSON."
        ),
        backstory=(
            "You coach students for technical interviews. You give realistic match scores "
            "and prioritize critical gaps over minor ones."
        ),
        verbose=True,
        allow_delegation=False,
        llm=model,
    )

    extract_resume_task = Task(
        description=(
            "Extract skills explicitly stated in the resume for candidate {candidate_name}.\n\n"
            "Rules:\n"
            "- Only include skills clearly mentioned in the text\n"
            "- Group technical skills, tools, and soft skills separately in your notes\n"
            "- Note experience level if stated\n\n"
            "--- RESUME TEXT ---\n"
            "{resume_text}\n"
            "--- END RESUME ---"
        ),
        expected_output=(
            "A structured list of explicitly mentioned skills, tools, qualifications, "
            "and strengths from the resume. No invented skills."
        ),
        agent=resume_extractor,
    )

    analyze_jd_task = Task(
        description=(
            "Analyze the job description for the {position_title} position.\n\n"
            "Separate:\n"
            "- Required / critical qualifications\n"
            "- Preferred / nice-to-have qualifications\n"
            "- Key responsibilities\n\n"
            "--- JOB DESCRIPTION ---\n"
            "{job_description}\n"
            "--- END JOB DESCRIPTION ---"
        ),
        expected_output=(
            "Required vs preferred skills and qualifications for {position_title}."
        ),
        agent=requirements_analyzer,
    )

    gap_analysis_task = Task(
        description=(
            "Using the resume extraction and job requirements from prior tasks, produce a "
            "skill gap analysis for {candidate_name} targeting {position_title}.\n\n"
            "Return JSON with exactly these fields:\n"
            "- match_score: integer 0–100\n"
            "- matching_skills: array of skill name strings the candidate clearly has\n"
            "- missing_skills: object with 'critical' and 'preferred' string arrays\n"
            "- strengths: array of strings\n"
            "- recommendations: array of actionable study steps\n"
            "- summary: 2–4 sentence honest assessment\n\n"
            "Be conservative — only count skills explicitly supported by the resume."
        ),
        expected_output=(
            "Valid JSON: match_score, matching_skills (string[]), "
            "missing_skills { critical, preferred }, strengths, recommendations, summary."
        ),
        agent=gap_specialist,
        output_pydantic=SkillGapAnalysisResult,
        context=[extract_resume_task, analyze_jd_task],
    )

    return Crew(
        agents=[resume_extractor, requirements_analyzer, gap_specialist],
        tasks=[extract_resume_task, analyze_jd_task, gap_analysis_task],
        process=Process.sequential,
        verbose=True,
    )


def run_skill_gap_crew(
    resume_text: str,
    job_description: str,
    *,
    candidate_name: str | None = None,
    position_title: str | None = None,
) -> SkillGapAnalysisResult:
    crew = create_skill_gap_crew()
    inputs = {
        "resume_text": resume_text,
        "job_description": job_description,
        "candidate_name": _default_candidate_name(candidate_name),
        "position_title": _default_position_title(position_title),
    }
    output = crew.kickoff(inputs=inputs)

    analysis: SkillGapAnalysisResult | None = None

    if hasattr(output, "tasks_output") and output.tasks_output:
        for task_output in output.tasks_output:
            if isinstance(task_output.pydantic, SkillGapAnalysisResult):
                analysis = task_output.pydantic
                break

    if analysis is None and isinstance(getattr(output, "pydantic", None), SkillGapAnalysisResult):
        analysis = output.pydantic

    if analysis is None and getattr(output, "json_dict", None):
        analysis = SkillGapAnalysisResult.model_validate(output.json_dict)

    if analysis is None and getattr(output, "raw", None):
        try:
            analysis = SkillGapAnalysisResult.model_validate(json.loads(output.raw))
        except (json.JSONDecodeError, ValueError):
            pass

    if analysis is None:
        raise ValueError("Crew did not return a valid skill gap analysis.")

    return analysis
