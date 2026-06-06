from app.models.skill_gap import MissingSkills, SkillGapAnalysisResult


def mock_skill_gap_analysis() -> SkillGapAnalysisResult:
    return SkillGapAnalysisResult(
        match_score=72,
        matching_skills=["React", "JavaScript", "Python", "REST APIs", "Git"],
        missing_skills=MissingSkills(
            critical=["TypeScript", "Unit testing"],
            preferred=["Next.js", "System design basics"],
        ),
        strengths=[
            "Hands-on React projects",
            "Comfortable with modern frontend tooling",
            "Solid programming fundamentals",
        ],
        recommendations=[
            "Migrate one project from JavaScript to TypeScript",
            "Add Vitest tests for 2–3 React components",
            "Study CSS layout (flexbox/grid) for responsive UI interviews",
        ],
        summary=(
            "Good technical foundation with a 72% skill match for this frontend role. "
            "Focus on TypeScript and testing to close critical gaps before applying."
        ),
    )
