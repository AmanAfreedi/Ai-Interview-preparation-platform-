export type MissingSkills = {
  critical: string[]
  preferred: string[]
}

export type SkillGapAnalysis = {
  match_score: number
  matching_skills: string[]
  missing_skills: MissingSkills
  strengths: string[]
  recommendations: string[]
  summary: string
}

export type SkillGapAnalyzeRequest = {
  resume_text: string
  job_description: string
  candidate_name?: string | null
  position_title?: string | null
  resume_id?: string | null
}

export type SkillGapAnalyzeResponse = {
  analysis: SkillGapAnalysis
}
