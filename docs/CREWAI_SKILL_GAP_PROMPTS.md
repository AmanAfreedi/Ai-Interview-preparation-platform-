# CrewAI website prompts — Skill Gap Analysis crew

Use these on [CrewAI](https://www.crewai.com/) (Crew / Flow builder) to create a **sequential** crew with **3 agents** and **3 tasks**. Set the process to **Sequential** so each task can use prior outputs.

After export, align the final task output schema with `backend/app/models/skill_gap.py` (`SkillGapAnalysisResult`).

**Validated crew (2026-06):** Resume Skills Extractor → Job Requirements Analyzer → Skill Gap Analysis Specialist. Input variables: `{candidate_name}`, `{position_title}`, `{resume_text}`, `{job_description}`.

---

## Project / crew description (paste first)

```
Build a sequential multi-agent crew for an interview-prep platform called "AI Study Platform".

Input: plain-text resume (extracted from PDF) and a job description.

Output: structured skill gap analysis JSON for students — match score, matching skills, missing skills, strengths, recommendations, and a short summary.

Agents must not invent skills that are not supported by the resume or job description text. Be honest and actionable.
```

---

## Agent 1 — Resume Skills Analyst

**Role**
```
Resume Skills Analyst
```

**Goal**
```
Extract structured skills, tools, experience level, and strengths from resume text with high precision. Only include skills supported by the resume.
```

**Backstory**
```
You are an expert technical recruiter who reads thousands of engineering and product resumes. You normalize skill names (e.g. "JS" → "JavaScript") and never hallucinate credentials or tools not mentioned in the text.
```

---

## Agent 2 — Job Description Analyst

**Role**
```
Job Description Analyst
```

**Goal**
```
Extract required skills, preferred skills, seniority, role title, responsibilities, and qualifications from a job description.
```

**Backstory**
```
You specialize in parsing hiring posts for software engineering roles. You clearly separate required vs nice-to-have skills and infer seniority from language like "junior", "2+ years", or "staff".
```

---

## Agent 3 — Career Gap Strategist

**Role**
```
Career Gap Strategist
```

**Goal**
```
Compare the resume profile and job requirements and produce an honest, actionable skill gap analysis for interview preparation.
```

**Backstory**
```
You coach students and early-career engineers preparing for campus and off-campus interviews. You prioritize gaps that matter most for the target role and suggest practical study steps (projects, topics, tools).
```

---

## Task 1 — Analyze resume

**Description** (use variables if the UI supports `{resume_text}`; otherwise paste placeholders)

```
Analyze the following resume text. Extract only skills and facts supported by the text.

--- RESUME TEXT ---
{resume_text}
--- END RESUME ---

Return a structured profile with:
- candidate_summary (2–3 sentences)
- experience_level: intern | junior | mid | senior | lead | unknown
- technical_skills (list of strings)
- soft_skills (list)
- tools_and_platforms (list)
- domains (list)
- strengths (list)
- notable_gaps_in_resume (skills weak or missing even before JD comparison)
```

**Expected output**
```
Valid JSON matching the ResumeProfile schema: candidate_summary, experience_level, technical_skills, soft_skills, tools_and_platforms, domains, strengths, notable_gaps_in_resume.
```

**Assigned agent:** Resume Skills Analyst

---

## Task 2 — Analyze job description

**Description**

```
Analyze the following job description. Separate required vs preferred skills.

--- JOB DESCRIPTION ---
{job_description}
--- END JOB DESCRIPTION ---

Return:
- role_title
- seniority: intern | junior | mid | senior | lead | unknown
- required_skills (list)
- preferred_skills (list)
- responsibilities (list)
- qualifications (list)
```

**Expected output**
```
Valid JSON matching the JobRequirements schema.
```

**Assigned agent:** Job Description Analyst

---

## Task 3 — Skill gap analysis (final)

**Description**

```
Using the resume extraction and job requirements from prior tasks, produce a skill gap analysis for {candidate_name} targeting {position_title}.

Rules:
- matching_skills: array of skill name strings the candidate clearly has
- missing_skills: object with "critical" (required) and "preferred" (nice-to-have) string arrays
- match_score: integer 0–100, realistic fit for this specific job
- strengths: 3–6 bullet strengths for this application
- recommendations: 3–7 concrete study actions ordered by impact
- summary: 2–4 sentences, encouraging but honest
- Only count skills explicitly supported by the resume — never invent skills
```

**Expected output**
```
Valid JSON: match_score, matching_skills (string[]), missing_skills { critical, preferred }, strengths, recommendations, summary.
```

**Assigned agent:** Skill Gap Analysis Specialist

**Context / inputs from previous tasks:** Enable context from Task 1 and Task 2.

---

## JSON schema hints (for CrewAI structured output)

If the builder asks for a schema, use these field names (snake_case) to match the backend:

**SkillGapAnalysisResult (final)**
```json
{
  "match_score": 75,
  "matching_skills": ["Python", "React", "SQL"],
  "missing_skills": {
    "critical": ["AWS", "Docker"],
    "preferred": ["GraphQL", "TypeScript"]
  },
  "strengths": ["Strong backend experience"],
  "recommendations": ["Consider AWS certification"],
  "summary": "Good technical foundation with 75% skill match."
}
```

**Crew input variables:** `candidate_name`, `position_title`, `resume_text`, `job_description`

---

## After you export from CrewAI

1. Copy generated `agents` / `tasks` into `backend/app/crews/skill_gap/crew.py`, or import the exported Python package.
2. Keep `output_pydantic` (or equivalent JSON schema) aligned with `backend/app/models/skill_gap.py`.
3. Test with `POST /api/skill-gap/analyze` at http://localhost:8000/docs

---

## Future crews (same pattern)

| Feature | Agents (suggested) |
|---------|-------------------|
| Roadmap | Role researcher, Curriculum designer, Timeline planner |
| Mock interview | Interviewer, Evaluator, Feedback coach |
| Quiz | Topic extractor, Question writer, Answer validator |
| Debate | Pro debater, Con debater, Judge |

Each crew = one FastAPI route under `/api/<feature>/`.
