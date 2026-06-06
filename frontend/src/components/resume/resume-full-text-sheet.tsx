import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatDate } from '@/lib/format'
import { getResumeText } from '@/types/resume'
import type { Resume } from '@/types/resume'

type ResumeFullTextSheetProps = {
  resume: Resume | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResumeFullTextSheet({
  resume,
  open,
  onOpenChange,
}: ResumeFullTextSheetProps) {
  const [copied, setCopied] = useState(false)

  if (!resume) {
    return null
  }

  let fullText = ''
  try {
    fullText = getResumeText(resume)
  } catch {
    fullText = resume.textPreview ?? ''
  }

  async function handleCopy() {
    if (!fullText) {
      return
    }
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
      >
        <SheetHeader className="shrink-0 border-b border-border/60 px-6 py-4 text-left">
          <SheetTitle className="truncate pr-8">{resume.fileName}</SheetTitle>
          <SheetDescription>
            Full extracted text · {fullText.length.toLocaleString()} characters
            {' · '}
            {formatDate(resume.createdAt)}
          </SheetDescription>
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!fullText}
              onClick={() => void handleCopy()}
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy text
                </>
              )}
            </Button>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {fullText ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {fullText}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No text is available for this resume. Try uploading the PDF again.
            </p>
          )}
        </div>

        <p className="shrink-0 border-t border-border/60 px-6 py-3 text-xs text-muted-foreground">
          This is text parsed from your PDF. The original file is not stored in
          the app.
        </p>
      </SheetContent>
    </Sheet>
  )
}
