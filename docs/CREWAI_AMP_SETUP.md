# CrewAI AMP integration (Option B)

Your **deployed** Skill Gap crew on [CrewAI AMP](https://app.crewai.com) is called by the FastAPI backend over HTTPS. The React app never talks to CrewAI directly.

```
React /skill-gap  →  POST /api/skill-gap/analyze  →  CrewAI AMP POST /kickoff
                                                    →  poll GET /status/{kickoff_id}
                                                    →  JSON back to UI
```

## What you need from CrewAI (2 values)

1. Log in to **https://app.crewai.com**
2. Open your **Skill Gap** crew
3. Go to the **Status** tab
4. Copy:
   - **Crew URL** (e.g. `https://your-crew-name.crewai.com`)
   - **Bearer Token**

Put them in `backend/.env`:

```env
SKILL_GAP_PROVIDER=crewai_amp
CREWAI_SKILL_GAP_BASE_URL=https://your-crew-name.crewai.com
CREWAI_SKILL_GAP_BEARER_TOKEN=paste-token-here
```

Restart the backend after saving.

## Verify connection

```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

Open: **http://localhost:8000/api/skill-gap/status**

You should see:

```json
{
  "provider": "crewai_amp",
  "crewai_amp_configured": true,
  "crewai_health": "Healthy",
  "crewai_required_inputs": ["candidate_name", "position_title", ...]
}
```

If `crewai_required_inputs` lists names we do not send, share that list so we can add mappings in `remote.py`.

## Expected crew inputs

This project sends:

| AMP input | Source |
|-----------|--------|
| `candidate_name` | Firebase profile username |
| `position_title` | Position title field on `/skill-gap` |
| `resume_text` | Selected resume from Firestore |
| `job_description` | JD textarea |

Your crew tasks must use these variable names in task descriptions, e.g. `{resume_text}` and `{job_description}`.

### Important: register all inputs on AMP

If `GET /inputs` only returns `candidate_name` and `position_title`, your crew **will not receive the resume or job description** even when the API sends them.

In CrewAI Studio, add these as **crew inputs**:

- `resume_text`
- `job_description`

Then reference them in every task that needs them:

```
--- RESUME ---
{resume_text}
--- JOB DESCRIPTION ---
{job_description}
```

Redeploy the crew after saving. `/inputs` should then list all four variables.

## Expected final JSON output

The last task on AMP must return JSON matching:

```json
{
  "match_score": 75,
  "matching_skills": ["Python", "React"],
  "missing_skills": {
    "critical": ["AWS"],
    "preferred": ["GraphQL"]
  },
  "strengths": ["..."],
  "recommendations": ["..."],
  "summary": "..."
}
```

## Test end-to-end

1. Backend running with `.env` configured
2. Frontend: `npm run dev` in `frontend/`
3. Upload resume → **Skill Gap** → select resume → paste JD → **Run skill gap analysis**

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `401` / invalid token | Re-copy Bearer Token from Status tab |
| `422` missing inputs | Check `/api/skill-gap/status` → `crewai_required_inputs` |
| Timeout after 300s | Increase `CREWAI_AMP_POLL_TIMEOUT_SECONDS` |
| Invalid JSON output | Ensure final AMP task returns raw JSON (not markdown prose only) |
| Still uses local crew | Set `SKILL_GAP_PROVIDER=crewai_amp` explicitly |

## Deploy checklist

- [ ] Crew deployed on AMP (Status shows live URL)
- [ ] Bearer token in `backend/.env` (never commit `.env`)
- [ ] `GET /api/skill-gap/status` returns `Healthy`
- [ ] One successful test from `/skill-gap` page
