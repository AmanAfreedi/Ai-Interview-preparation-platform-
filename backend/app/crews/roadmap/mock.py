def mock_roadmap(skills: str, days: str) -> str:
    """Returns a minimal markdown roadmap for local dev / mock mode."""
    return f"""# {days}-Day Learning Roadmap for {skills}

## Executive Summary

This is a mock roadmap generated for development and testing purposes.
Set `ROADMAP_MOCK=false` and configure `CREWAI_ROADMAP_BASE_URL` to use the real AI agent.

- **Learning strategy:** Progressive skill building from fundamentals to advanced topics
- **Structured approach:** Daily focused sessions with hands-on practice

## Skills Analysis

| Skill | Difficulty | Prerequisites | Estimated Time Allocation |
|-------|------------|---------------|--------------------------|
| {skills.split(",")[0].strip()} | Medium | Basic programming | {days} days |

## Daily Learning Schedule

### Day 1: Introduction and Setup
- **Task:** Set up development environment and review learning goals
- **Resources:** Official documentation, freeCodeCamp, YouTube tutorials
- **Time Estimate:** 2 hours

### Day 2: Core Concepts
- **Task:** Study foundational concepts and complete beginner exercises
- **Resources:** Official docs, Udemy, Coursera
- **Time Estimate:** 2-3 hours

## Resource Library

### {skills.split(",")[0].strip()}
- **Books:** Official documentation, "Learning {skills.split(",")[0].strip()}"
- **Online Resources:** freeCodeCamp, Coursera, YouTube

## Milestones and Progress Checkpoints

1. Complete environment setup by Day 1
2. Finish introductory module by Day 7
3. Build first practice project by Day {int(int(days) * 0.5)}
4. Complete full roadmap by Day {days}

## Practice Projects and Exercises

- Build a small project applying all learned skills
- Complete at least 3 coding exercises per skill

## Tips for Effective Learning and Retention

- Study consistently each day rather than cramming
- Practice hands-on coding immediately after learning a concept
- Use spaced repetition for memorizing syntax and concepts
"""
