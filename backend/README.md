# AI Study Platform — Backend

FastAPI service that calls your **CrewAI AMP** deployed crew (Option B) or runs a local crew (Option A). The frontend calls this API only.

## Quick start

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
# Option B: set CREWAI_SKILL_GAP_BASE_URL + CREWAI_SKILL_GAP_BEARER_TOKEN
# Or SKILL_GAP_MOCK=true for UI-only dev

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: http://localhost:8000/health  
- Docs: http://localhost:8000/docs  
- Skill gap: `POST /api/skill-gap/analyze`  
- AMP status: `GET /api/skill-gap/status`  

**Option B setup guide:** [docs/CREWAI_AMP_SETUP.md](../docs/CREWAI_AMP_SETUP.md)

## Skill gap crew (3 agents)

| Order | Agent | Output |
|-------|--------|--------|
| 1 | Resume Skills Extractor | Explicit skills from resume (task context) |
| 2 | Job Requirements Analyzer | Required vs preferred qualifications |
| 3 | Skill Gap Analysis Specialist | `SkillGapAnalysisResult` JSON |

**Kickoff inputs:** `candidate_name`, `position_title`, `resume_text`, `job_description`

Code lives in `app/crews/skill_gap/crew.py`. After you build agents on the [CrewAI](https://www.crewai.com/) site, export or copy their roles/tasks into that file (or replace the crew with your exported module).

Copy-paste prompts for the CrewAI website: **[docs/CREWAI_SKILL_GAP_PROMPTS.md](../docs/CREWAI_SKILL_GAP_PROMPTS.md)**

## Request body

```json
{
  "resume_text": "... extracted from Firestore ...",
  "job_description": "... pasted JD ...",
  "candidate_name": "Aman",
  "position_title": "Frontend Engineer",
  "resume_id": "optional-uuid"
}
```

**Response `analysis` shape:**
```json
{
  "match_score": 75,
  "matching_skills": ["Python", "React"],
  "missing_skills": { "critical": ["AWS"], "preferred": ["GraphQL"] },
  "strengths": ["..."],
  "recommendations": ["..."],
  "summary": "..."
}
```

## Adding more agent features

Use one folder per feature under `app/crews/`:

```
app/crews/
  skill_gap/
  roadmap/
  mock_interview/
```

Each exposes a `run_*` function; add a route under `app/api/`.
