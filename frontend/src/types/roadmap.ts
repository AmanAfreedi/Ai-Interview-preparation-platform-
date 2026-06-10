export type RoadmapRequest = {
  skills: string   // comma-separated list of skills
  days: string     // number as string e.g. "30"
}

export type RoadmapResponse = {
  roadmap_markdown: string
}
