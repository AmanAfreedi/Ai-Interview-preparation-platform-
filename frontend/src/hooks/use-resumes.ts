import { useCallback, useEffect, useState } from 'react'

import {
  deleteResume,
  saveResumeFromPdf,
  subscribeToUserResumes,
} from '@/lib/firebase/resumes'
import { useAuth } from '@/hooks/use-auth'
import type { Resume } from '@/types/resume'

export function useResumes() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setResumes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToUserResumes(
      user.uid,
      (nextResumes) => {
        setResumes(nextResumes)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user])

  const parseAndSave = useCallback(
    async (file: File) => {
      if (!user) {
        throw new Error('You must be signed in to add a resume.')
      }

      setProcessing(true)
      setError(null)

      try {
        await saveResumeFromPdf(user.uid, file)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Could not save resume text. Please try again.'
        setError(message)
        throw err
      } finally {
        setProcessing(false)
      }
    },
    [user],
  )

  const remove = useCallback(async (resume: Resume) => {
    setDeletingId(resume.id)
    setError(null)

    try {
      await deleteResume(resume)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not delete resume.'
      setError(message)
      throw err
    } finally {
      setDeletingId(null)
    }
  }, [])

  return {
    resumes,
    loading,
    error,
    processing,
    /** @deprecated use `processing` */
    uploading: processing,
    deletingId,
    parseAndSave,
    /** @deprecated use `parseAndSave` */
    upload: parseAndSave,
    remove,
    clearError: () => setError(null),
  }
}
