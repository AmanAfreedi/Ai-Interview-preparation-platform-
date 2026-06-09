from app.models.skill_gap import SkillGapAnalysisResult

PLACEHOLDER_PHRASES = (
    "without the candidate's resume",
    "without the resume",
    "provide the resume",
    "provide the job description",
    "share the specific job description",
    "unable to conduct",
    "need two pieces of information",
    "please provide both",
)


def is_placeholder_analysis(analysis: SkillGapAnalysisResult) -> bool:
    """Detect when the crew ran but never received resume / JD."""
    summary = analysis.summary.lower()
    recommendations = " ".join(analysis.recommendations).lower()
    combined = f"{summary} {recommendations}"

    if any(phrase in combined for phrase in PLACEHOLDER_PHRASES):
        return True

    if (
        analysis.match_score == 0
        and not analysis.matching_skills
        and not analysis.missing_skills.critical
        and not analysis.missing_skills.preferred
        and not analysis.strengths
    ):
        return True

    return False


PLACEHOLDER_ERROR_MESSAGE = (
    "The AI crew could not access your resume or job description. "
    "Your CrewAI deployment must declare resume_text and job_description "
    "as crew inputs and use them in task prompts, then redeploy."
)
