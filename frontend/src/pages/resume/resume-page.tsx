import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { ResumeList } from '@/components/resume/resume-list'
import { ResumeUploadZone } from '@/components/resume/resume-upload-zone'
import { Button } from '@/components/ui/button'
import { useResumes } from '@/hooks/use-resumes'

export function ResumePage() {
  const navigate = useNavigate()
  const {
    resumes,
    loading,
    error,
    processing,
    deletingId,
    parseAndSave,
    remove,
    clearError,
  } = useResumes()

  const hasReadyResume = resumes.some((r) => r.status === 'ready')

  return (
    <div className="flex flex-1 flex-col gap-8">
      <PageHeader
        title="Resume"
        description="Upload a PDF to extract and save resume text in Firestore. Skill gap, roadmap, and other features will use this text — not the original file."
      />

      <section className="space-y-4">
        <ResumeUploadZone
          processing={processing}
          onParse={async (file) => {
            clearError()
            await parseAndSave(file)
          }}
        />

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <PageHeader
            title="Saved resume text"
            description={
              resumes.length > 0
                ? `${resumes.length} resume${resumes.length === 1 ? '' : 's'} ready for analysis`
                : 'Parsed resumes appear here'
            }
          />
          {hasReadyResume && (
            <Button
              type="button"
              onClick={() => navigate('/skill-gap')}
              className="shrink-0"
            >
              Go to Skill Gap
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
        <ResumeList
          resumes={resumes}
          loading={loading}
          deletingId={deletingId}
          onDelete={remove}
        />
      </section>
    </div>
  )
}
