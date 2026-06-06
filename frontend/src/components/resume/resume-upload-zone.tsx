import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FileUp, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RESUME_MAX_BYTES, RESUME_MIME_TYPE } from '@/lib/firebase/resumes'
import { formatFileSize } from '@/lib/format'
import { cn } from '@/lib/utils'

type ResumeUploadZoneProps = {
  processing: boolean
  onParse: (file: File) => Promise<void>
}

export function ResumeUploadZone({ processing, onParse }: ResumeUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file || processing) {
      return
    }

    await onParse(file)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    void handleFile(file)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    void handleFile(file)
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault()
        setDragActive(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setDragActive(false)
      }}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
        dragActive
          ? 'border-primary bg-primary/5'
          : 'border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card/80',
        processing && 'pointer-events-none opacity-70',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={RESUME_MIME_TYPE}
        className="sr-only"
        onChange={handleInputChange}
        disabled={processing}
      />

      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {processing ? (
          <Loader2 className="size-7 animate-spin" />
        ) : (
          <FileUp className="size-7" />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-base font-medium">
          {processing ? 'Extracting text from PDF…' : 'Drop your PDF here'}
        </p>
        <p className="text-sm text-muted-foreground">
          PDF only · max {formatFileSize(RESUME_MAX_BYTES)} · only text is saved
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={processing}
        onClick={() => inputRef.current?.click()}
      >
        {processing ? 'Processing…' : 'Choose file'}
      </Button>
    </div>
  )
}
