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

Open: **https://ai-interview-preparation-platform-9p5u.onrender.com/api/skill-gap/status** (or `http://localhost:8000/...` when running locally)

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

### Critical: register resume + job description on AMP

**Current issue (verified):** `/inputs` returns only:

```json
["position_title", "candidate_name"]
```

The app **does** send resume text and job description, but CrewAI AMP **drops** any input not declared on the crew. Agents then respond with *"Please provide the resume..."* and a useless `0` match score.

**Fix in CrewAI Studio (required for Option B):**

1. Open your Skill Gap crew → **Inputs** (or crew variables)
2. Add:
   - `resume_text`
   - `job_description`
3. Edit **every task** that needs them, e.g. Task 1:

```
Candidate: {candidate_name}
Role: {position_title}

--- RESUME ---
{resume_text}

--- JOB DESCRIPTION ---
{job_description}
```

4. **Redeploy** to AMP
5. Confirm: `GET https://your-crew.crewai.com/inputs` lists all **four** keys

**Temporary workaround:** Add `OPENAI_API_KEY` on Render — the backend will auto-fallback to the local 3-agent crew when AMP inputs are incomplete.

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
- [ ] Bearer token in `backend/.env` / Render env (never commit `.env`)
- [ ] `GET /api/skill-gap/status` returns `Healthy`
- [ ] CORS on Render includes `https://stalwart-macaron-915ce6.netlify.app`
- [ ] Netlify build has `VITE_API_URL` → Render backend URL
- [ ] Firebase Auth → Authorized domains includes `stalwart-macaron-915ce6.netlify.app`
- [ ] One successful test from live `/skill-gap` page
