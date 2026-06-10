import {
  BarChart3,
  Copy,
  Download,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { buildRoadmap } from '@/lib/api/roadmap'
import { ApiError, getApiBaseUrl } from '@/lib/api/client'
import { getFirebaseAuth } from '@/lib/firebase/app'
import { cn } from '@/lib/utils'

/* ─── Skill tag chip ─────────────────────────────────────────────────────── */

function SkillChip({
  skill,
  onRemove,
  disabled,
}: {
  skill: string
  onRemove: () => void
  disabled: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 pl-3 pr-1.5 py-1 text-sm font-medium">
      {skill}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${skill}`}
        className="flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive disabled:pointer-events-none"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

/* ─── Markdown renderer ──────────────────────────────────────────────────── */

/**
 * Renders the crew's raw markdown output as styled HTML.
 * Handles h1/h2/h3, tables, ordered/unordered lists, bold, code, and paragraphs.
 */
function renderMarkdown(markdown: string): string {
  let html = markdown
    // Escape existing HTML to prevent XSS from crew output
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (``` ... ```)
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '')
    return `<pre class="my-3 overflow-x-auto rounded-lg bg-muted/60 px-4 py-3 text-sm font-mono leading-relaxed">${code}</pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-muted/60 px-1.5 py-0.5 text-sm font-mono">$1</code>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')

  // H1
  html = html.replace(/^# (.+)$/gm, '<h1 class="mt-6 mb-3 text-xl font-bold tracking-tight first:mt-0">$1</h1>')

  // H2
  html = html.replace(/^## (.+)$/gm, '<h2 class="mt-6 mb-2 text-base font-semibold text-primary">$1</h2>')

  // H3
  html = html.replace(/^### (.+)$/gm, '<h3 class="mt-4 mb-1.5 text-sm font-semibold">$1</h3>')

  // Tables — convert pipe-delimited rows
  html = html.replace(/(?:^\|.+\|\n)+/gm, (table) => {
    const rows = table.trim().split('\n').filter((row) => !/^\|[-| :]+\|$/.test(row))
    const [headerRow, ...bodyRows] = rows
    const toCell = (row: string, tag: string) =>
      row
        .split('|')
        .slice(1, -1)
        .map((cell) => `<${tag} class="border border-border/60 px-3 py-1.5 text-sm">${cell.trim()}</${tag}>`)
        .join('')
    const thead = `<thead class="bg-muted/50"><tr>${toCell(headerRow, 'th')}</tr></thead>`
    const tbody = bodyRows
      .map((r) => `<tr class="even:bg-muted/20">${toCell(r, 'td')}</tr>`)
      .join('')
    return `<div class="my-4 overflow-x-auto rounded-lg border border-border/60"><table class="w-full border-collapse">${thead}<tbody>${tbody}</tbody></table></div>`
  })

  // Ordered lists — collect consecutive lines
  html = html.replace(/(?:^\d+\. .+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li class="ml-4 text-sm">${line.replace(/^\d+\. /, '')}</li>`)
      .join('')
    return `<ol class="my-2 list-decimal space-y-1 pl-2">${items}</ol>`
  })

  // Unordered lists
  html = html.replace(/(?:^[-*] .+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li class="ml-4 text-sm">${line.replace(/^[-*] /, '')}</li>`)
      .join('')
    return `<ul class="my-2 list-disc space-y-1 pl-2">${items}</ul>`
  })

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-4 border-border/60" />')

  // Paragraphs — wrap remaining plain lines
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<[a-z]/.test(trimmed)) return trimmed
      return `<p class="text-sm leading-relaxed text-foreground/90">${trimmed.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')

  return html
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

const SUGGESTED_DAYS = [7, 14, 21, 30, 45, 60, 90]

export function RoadmapPage() {
  const { user } = useAuth()
  const location = useLocation()
  const prefillSkills = (location.state as { prefillSkills?: string } | null)?.prefillSkills ?? ''

  // Skills as array for chip UI
  const [skills, setSkills] = useState<string[]>(() =>
    prefillSkills
      ? prefillSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
  )
  const [skillInput, setSkillInput] = useState('')
  const [days, setDays] = useState('30')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // If navigated from skill-gap with pre-filled skills, show a hint banner
  const cameFromSkillGap = Boolean(prefillSkills)

  useEffect(() => {
    if (prefillSkills) {
      setSkills(prefillSkills.split(',').map((s) => s.trim()).filter(Boolean))
    }
  }, [prefillSkills])

  function addSkill(raw: string) {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
    setSkills((prev) => {
      const existing = new Set(prev.map((s) => s.toLowerCase()))
      const newOnes = parts.filter((p) => !existing.has(p.toLowerCase()))
      return [...prev, ...newOnes]
    })
    setSkillInput('')
  }

  function removeSkill(index: number) {
    setSkills((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (skillInput.trim()) addSkill(skillInput)
    } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1))
    }
  }

  async function handleGenerate() {
    if (!user) return
    if (skills.length === 0) {
      setError('Add at least one skill to build a roadmap.')
      return
    }
    const daysNum = parseInt(days, 10)
    if (!daysNum || daysNum < 1 || daysNum > 365) {
      setError('Days must be between 1 and 365.')
      return
    }

    setGenerating(true)
    setError(null)
    setMarkdown(null)

    try {
      const idToken = await getFirebaseAuth().currentUser?.getIdToken()
      const response = await buildRoadmap(
        { skills: skills.join(', '), days: String(daysNum) },
        idToken,
      )
      setMarkdown(response.roadmap_markdown)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(
          err.message.includes('fetch')
            ? `Could not reach the API at ${getApiBaseUrl()}. Check that the backend is running.`
            : err.message,
        )
      } else {
        setError('Roadmap generation failed. Please try again.')
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!markdown) return
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!markdown) return
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roadmap-${days}-days.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canGenerate = skills.length > 0 && Boolean(parseInt(days, 10))

  return (
    <div className="flex flex-1 flex-col gap-8">
      <PageHeader
        title="Roadmap"
        description="Generate a personalized day-by-day learning plan based on the skills you want to master."
      />

      {/* Pre-fill banner from skill-gap */}
      {cameFromSkillGap && skills.length > 0 && (
        <div className="flex max-w-2xl items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground/80">
            Skills pre-filled from your skill gap analysis. Remove any you've already mastered and set your timeframe.
          </p>
        </div>
      )}

      {/* Input form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4 text-primary" />
            Plan your learning
          </CardTitle>
          <CardDescription>
            Add skills you want to learn and how many days you have. Separate
            skills by pressing Enter or comma.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">

          {/* Skills chip input */}
          <div className="space-y-2">
            <Label htmlFor="skill-input">Skills to learn</Label>
            <div
              className={cn(
                'flex min-h-[80px] w-full flex-wrap gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs',
                'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                generating && 'pointer-events-none opacity-70',
              )}
              onClick={() => inputRef.current?.focus()}
            >
              {skills.map((skill, i) => (
                <SkillChip
                  key={i}
                  skill={skill}
                  onRemove={() => removeSkill(i)}
                  disabled={generating}
                />
              ))}
              <input
                ref={inputRef}
                id="skill-input"
                type="text"
                placeholder={skills.length === 0 ? 'e.g. Python, React, Docker…' : 'Add more…'}
                value={skillInput}
                disabled={generating}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => { if (skillInput.trim()) addSkill(skillInput) }}
                className="min-w-[160px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add each skill. Backspace removes the last one.
            </p>
          </div>

          {/* Days input */}
          <div className="space-y-2">
            <Label htmlFor="days-input">Days available</Label>
            <div className="flex flex-wrap items-center gap-2">
              {SUGGESTED_DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={generating}
                  onClick={() => setDays(String(d))}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    days === String(d)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    generating && 'pointer-events-none opacity-70',
                  )}
                >
                  {d}d
                </button>
              ))}
              <input
                id="days-input"
                type="number"
                min={1}
                max={365}
                placeholder="Custom"
                value={days}
                disabled={generating}
                onChange={(e) => setDays(e.target.value)}
                className={cn(
                  'h-8 w-24 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs',
                  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none',
                )}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            disabled={generating || !canGenerate}
            onClick={() => void handleGenerate()}
          >
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Building roadmap…
              </>
            ) : (
              <>
                <BarChart3 className="size-4" />
                Generate {days ? `${days}-day` : ''} roadmap
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">API: {getApiBaseUrl()}</p>
        </CardContent>
      </Card>

      {/* Skeleton while generating */}
      {generating && <RoadmapSkeleton />}

      {/* Rendered roadmap */}
      {markdown && !generating && (
        <RoadmapOutput
          markdown={markdown}
          copied={copied}
          onCopy={() => void handleCopy()}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function RoadmapSkeleton() {
  return (
    <div className="flex max-w-3xl animate-pulse flex-col gap-4">
      <div className="h-10 w-2/3 rounded-xl bg-muted/60" />
      <div className="h-5 w-full rounded-lg bg-muted/60" />
      <div className="h-5 w-5/6 rounded-lg bg-muted/60" />
      <div className="mt-2 h-32 rounded-xl bg-muted/60" />
      <div className="h-5 w-1/2 rounded-lg bg-muted/60" />
      <div className="h-48 rounded-xl bg-muted/60" />
      <div className="h-48 rounded-xl bg-muted/60" />
      <div className="h-24 rounded-xl bg-muted/60" />
    </div>
  )
}

/* ─── Output ─────────────────────────────────────────────────────────────── */

function RoadmapOutput({
  markdown,
  copied,
  onCopy,
  onDownload,
}: {
  markdown: string
  copied: boolean
  onCopy: () => void
  onDownload: () => void
}) {
  const rendered = renderMarkdown(markdown)

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Your roadmap</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopy}
          >
            <Copy className="size-3.5" />
            {copied ? 'Copied!' : 'Copy markdown'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownload}
          >
            <Download className="size-3.5" />
            Download .md
          </Button>
        </div>
      </div>

      {/* Rendered markdown */}
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="pt-6">
          <div
            className="prose-sm max-w-none"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
