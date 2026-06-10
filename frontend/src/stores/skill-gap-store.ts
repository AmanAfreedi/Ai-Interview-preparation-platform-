import { create } from 'zustand'
import type { SkillGapAnalysis } from '@/types/skill-gap'

type SkillGapStore = {
  lastAnalysis: SkillGapAnalysis | null
  setLastAnalysis: (analysis: SkillGapAnalysis) => void
  clearAnalysis: () => void
  /** Returns all gap skills (critical + preferred) as a comma-separated string */
  getGapSkills: () => string
}

export const useSkillGapStore = create<SkillGapStore>((set, get) => ({
  lastAnalysis: null,

  setLastAnalysis: (analysis) => set({ lastAnalysis: analysis }),

  clearAnalysis: () => set({ lastAnalysis: null }),

  getGapSkills: () => {
    const analysis = get().lastAnalysis
    if (!analysis) return ''
    return [
      ...analysis.missing_skills.critical,
      ...analysis.missing_skills.preferred,
    ].join(', ')
  },
}))
