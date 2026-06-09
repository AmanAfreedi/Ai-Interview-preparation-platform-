RESUME_INPUT_KEYS = frozenset(
    {"resume_text", "resume", "resume_content", "candidate_resume", "cv_text"},
)
JD_INPUT_KEYS = frozenset(
    {
        "job_description",
        "job_description_text",
        "jd",
        "position_description",
        "job_posting",
    },
)

AMP_MISSING_INPUTS_MESSAGE = (
    "Your CrewAI AMP crew is missing required inputs. It only accepts "
    "candidate_name and position_title, so resume and job description never "
    "reach the agents. In CrewAI Studio, add crew inputs resume_text and "
    "job_description, reference them in all task descriptions as "
    "{resume_text} and {job_description}, then redeploy. "
    "Alternatively, set OPENAI_API_KEY on Render for automatic local fallback."
)


def amp_has_resume_and_jd(required_inputs: list[str]) -> bool:
    declared = set(required_inputs)
    has_resume = bool(declared & RESUME_INPUT_KEYS)
    has_jd = bool(declared & JD_INPUT_KEYS)
    return has_resume and has_jd
