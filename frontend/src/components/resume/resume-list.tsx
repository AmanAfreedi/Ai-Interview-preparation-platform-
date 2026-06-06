import { useState } from 'react'
import { Eye, FileText, Loader2, Trash2 } from 'lucide-react'

import { ResumeFullTextSheet } from '@/components/resume/resume-full-text-sheet'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Resume, ResumeStatus } from '@/types/resume'

type ResumeListProps = {
  resumes: Resume[]
  loading: boolean
  deletingId: string | null
  onDelete: (resume: Resume) => Promise<void>
}

const statusLabels: Record<ResumeStatus, string> = {
  processing: 'Processing',
  ready: 'Saved',
  error: 'Failed',
}

const statusStyles: Record<ResumeStatus, string> = {
  processing: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  ready: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  error: 'bg-destructive/15 text-destructive',
}

const PREVIEW_CLAMP_LENGTH = 280

export function ResumeList({
  resumes,
  loading,
  deletingId,
  onDelete,
}: ResumeListProps) {
  const [viewingResume, setViewingResume] = useState<Resume | null>(null)

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    )
  }

  if (resumes.length === 0) {
    return (
      <Card className="border-dashed bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg">No resumes yet</CardTitle>
          <CardDescription>
            Upload a PDF above. We extract the text and save it to your account
            — the PDF file itself is not stored.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <ul className="space-y-3">
        {resumes.map((resume) => {
          const isDeleting = deletingId === resume.id
          const fullText = resume.extractedText?.trim() ?? ''
          const preview =
            resume.textPreview ??
            (fullText ? fullText.slice(0, PREVIEW_CLAMP_LENGTH) : '')
          const hasFullText = fullText.length > 0
          const showViewFull =
            hasFullText && fullText.length > preview.length

          return (
            <li key={resume.id}>
              <Card className="border-border/60 bg-card/80 shadow-sm">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="truncate text-base">
                        {resume.fileName}
                      </CardTitle>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          statusStyles[resume.status],
                        )}
                      >
                        {statusLabels[resume.status]}
                      </span>
                    </div>
                    <CardDescription>
                      {hasFullText
                        ? `${fullText.length.toLocaleString()} characters`
                        : 'No text'}
                      {' · '}
                      {formatDate(resume.createdAt)}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={isDeleting || resume.status === 'processing'}
                    onClick={() => void onDelete(resume)}
                    aria-label={`Delete ${resume.fileName}`}
                  >
                    {isDeleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </CardHeader>

                {(preview || resume.errorMessage || hasFullText) && (
                  <CardContent className="space-y-3 pt-0">
                    {resume.errorMessage && (
                      <p className="text-sm text-destructive">
                        {resume.errorMessage}
                      </p>
                    )}

                    {preview && (
                      <p className="line-clamp-3 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                        {preview}
                        {showViewFull ? '…' : ''}
                      </p>
                    )}

                    {hasFullText && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setViewingResume(resume)}
                      >
                        <Eye className="size-4" />
                        View full resume
                      </Button>
                    )}

                    {resume.status === 'ready' && !hasFullText && (
                      <p className="text-sm text-muted-foreground">
                        Saved, but no text is available. Upload the PDF again.
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            </li>
          )
        })}
      </ul>

      <ResumeFullTextSheet
        resume={viewingResume}
        open={viewingResume !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewingResume(null)
          }
        }}
      />
    </>
  )
}
