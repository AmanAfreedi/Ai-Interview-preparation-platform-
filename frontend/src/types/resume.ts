export type ResumeStatus = 'processing' | 'ready' | 'error'

export type Resume = {
  id: string
  userId: string
  fileName: string
  fileSize: number
  status: ResumeStatus
  extractedText: string | null
  textPreview: string | null
  errorMessage: string | null
  createdAt: Date
}

/** Full resume text for skill gap, roadmap, and other AI features. */
export function getResumeText(resume: Resume): string {
  const text = resume.extractedText?.trim()
  if (!text) {
    throw new Error('This resume has no extracted text.')
  }
  return text
}
