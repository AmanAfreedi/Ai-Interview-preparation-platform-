import { apiRequest } from '@/lib/api/client'
import type {
  SkillGapAnalyzeRequest,
  SkillGapAnalyzeResponse,
} from '@/types/skill-gap'

export function analyzeSkillGap(
  payload: SkillGapAnalyzeRequest,
  idToken?: string | null,
): Promise<SkillGapAnalyzeResponse> {
  return apiRequest<SkillGapAnalyzeResponse>('/api/skill-gap/analyze', {
    method: 'POST',
    body: payload,
    idToken,
  })
}
