import { create } from 'zustand'

type RoadmapStore = {
  lastMarkdown: string | null
  lastSkills: string
  lastDays: string
  setLastRoadmap: (markdown: string, skills: string, days: string) => void
  clearRoadmap: () => void
}

export const useRoadmapStore = create<RoadmapStore>((set) => ({
  lastMarkdown: null,
  lastSkills: '',
  lastDays: '30',

  setLastRoadmap: (markdown, skills, days) =>
    set({ lastMarkdown: markdown, lastSkills: skills, lastDays: days }),

  clearRoadmap: () =>
    set({ lastMarkdown: null, lastSkills: '', lastDays: '30' }),
}))
