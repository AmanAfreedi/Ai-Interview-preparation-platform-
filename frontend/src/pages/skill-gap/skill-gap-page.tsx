import { BarChart3, Loader2, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useResumes } from '@/hooks/use-resumes'
import { analyzeSkillGap } from '@/lib/api/skill-gap'
import { ApiError, getApiBaseUrl } from '@/lib/api/client'
import { getFirebaseAuth } from '@/lib/firebase/app'
import { useSkillGapStore } from '@/stores/skill-gap-store'
import { getResumeText } from '@/types/resume'
import type { SkillGapAnalysis } from '@/types/skill-gap'
import { cn } from '@/lib/utils'

const MIN_JD_LENGTH = 30

export function SkillGapPage() {
  const { user, profile } = useAuth()
  const { resumes, loading: resumesLoading } = useResumes()
  const navigate = useNavigate()
  const setLastAnalysis = useSkillGapStore((s) => s.setLastAnalysis)
  const result = useSkillGapStore((s) => s.lastAnalysis)

  const readyResumes = useMemo(
    () => resumes.filter((r) => r.status === 'ready' && r.extractedText),
    [resumes],
  )

  const [resumeId, setResumeId] = useState('')
  const [positionTitle, setPositionTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedResume = readyResumes.find((r) => r.id === resumeId)
  const candidateName =
    profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Candidate'

  async function handleAnalyze() {
    if (!user || !selectedResume) {
      setError('Select a resume with extracted text.')
      return
    }

    const jd = jobDescription.trim()
    if (jd.length < MIN_JD_LENGTH) {
      setError(`Job description must be at least ${MIN_JD_LENGTH} characters.`)
      return
    }

    setAnalyzing(true)
    setError(null)

    try {
      const idToken = await getFirebaseAuth().currentUser?.getIdToken()
      const resumeText = getResumeText(selectedResume)
      const response = await analyzeSkillGap(
        {
          resume_text: resumeText,
          job_description: jd,
          candidate_name: candidateName,
          position_title: positionTitle.trim() || undefined,
          resume_id: selectedResume.id,
        },
        idToken,
      )
      setLastAnalysis(response.analysis)
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
        setError('Analysis failed. Please try again.')
      }
    } finally {
      setAnalyzing(false)
    }
  }

  function handleBuildRoadmap(analysis: SkillGapAnalysis) {
    // Combine critical + preferred gaps and pass them to the roadmap page as pre-filled skills
    const gapSkills = [
      ...analysis.missing_skills.critical,
      ...analysis.missing_skills.preferred,
    ]
    const skillsString = gapSkills.join(', ')
    navigate('/roadmap', { state: { prefillSkills: skillsString } })
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <PageHeader
        title="Skill Gap"
        description="Compare your saved resume text against a job description. Analysis runs on the FastAPI backend via your CrewAI agents."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4 text-primary" />
            Inputs
          </CardTitle>
          <CardDescription>
            Upload resumes on the Resume page first. Position title personalizes the crew
            analysis for {candidateName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="resume-select">Resume</Label>
            <select
              id="resume-select"
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs',
                'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none',
              )}
              value={resumeId}
              disabled={resumesLoading || analyzing}
              onChange={(e) => setResumeId(e.target.value)}
            >
              <option value="">
                {resumesLoading
                  ? 'Loading resumes…'
                  : readyResumes.length === 0
                    ? 'No ready resumes — upload on Resume page'
                    : 'Select a resume'}
              </option>
              {readyResumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.fileName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-title">Position title</Label>
            <Input
              id="position-title"
              placeholder="e.g. Frontend Engineer, SDE Intern"
              value={positionTitle}
              disabled={analyzing}
              onChange={(e) => setPositionTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Job description</Label>
            <textarea
              id="job-description"
              rows={10}
              placeholder="Paste the full job posting: role, requirements, responsibilities…"
              className={cn(
                'flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs',
                'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none',
              )}
              value={jobDescription}
              disabled={analyzing}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            disabled={
              analyzing || !resumeId || jobDescription.trim().length < MIN_JD_LENGTH
            }
            onClick={() => void handleAnalyze()}
          >
            {analyzing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              'Run skill gap analysis'
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            API: {getApiBaseUrl()}
          </p>
        </CardContent>
      </Card>

      {result && (
        <SkillGapResults
          analysis={result}
          onBuildRoadmap={() => handleBuildRoadmap(result)}
        />
      )}
    </div>
  )
}

function SkillGapResults({
  analysis,
  onBuildRoadmap,
}: {
  analysis: SkillGapAnalysis
  onBuildRoadmap: () => void
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Match score</CardTitle>
          <CardDescription>Overall fit for this role</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tabular-nums text-primary">
            {analysis.match_score}
            <span className="text-lg font-normal text-muted-foreground"> / 100</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <SkillTagsCard
          title="Matching skills"
          description="Skills you already demonstrate for this role"
          skills={analysis.matching_skills}
          emptyMessage="No strong matches identified."
          variant="match"
        />
        <div className="flex flex-col gap-4">
          <SkillTagsCard
            title="Critical gaps"
            description="Required skills to prioritize"
            skills={analysis.missing_skills.critical}
            emptyMessage="No critical gaps identified."
            variant="critical"
          />
          <SkillTagsCard
            title="Preferred gaps"
            description="Nice-to-have skills to strengthen your profile"
            skills={analysis.missing_skills.preferred}
            emptyMessage="No preferred gaps identified."
            variant="preferred"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {analysis.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended next steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-2 text-sm">
            {analysis.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Button
        type="button"
        size="lg"
        onClick={onBuildRoadmap}
        className="self-start"
      >
        <BarChart3 className="size-4" />
        Build Roadmap
      </Button>
    </div>
  )
}

function SkillTagsCard({
  title,
  description,
  skills,
  emptyMessage,
  variant,
}: {
  title: string
  description: string
  skills: string[]
  emptyMessage: string
  variant: 'match' | 'critical' | 'preferred'
}) {
  const borderClass =
    variant === 'match'
      ? 'border-emerald-500/20'
      : variant === 'critical'
        ? 'border-red-500/20'
        : 'border-amber-500/20'

  return (
    <Card className={borderClass}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-sm font-medium"
              >
                {skill}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
