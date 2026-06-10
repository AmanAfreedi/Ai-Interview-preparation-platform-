import { apiRequest } from '@/lib/api/client'
import type { RoadmapRequest, RoadmapResponse } from '@/types/roadmap'

export function buildRoadmap(
  payload: RoadmapRequest,
  idToken?: string | null,
): Promise<RoadmapResponse> {
  return apiRequest<RoadmapResponse>('/api/roadmap/generate', {
    method: 'POST',
    body: payload,
    idToken,
  })
}
