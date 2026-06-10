import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageSquare,
  Mic,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ─── Data ───────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: FileText,
    title: 'Resume Parser',
    description:
      'Upload your PDF and we instantly extract the text — no cloud storage, no privacy risks. Your resume text powers every AI feature.',
    accent: 'from-violet-500/15 to-indigo-500/5',
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    available: true,
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    description:
      'Paste a job description and our 3-agent CrewAI crew tells you exactly where you match, what you're missing, and how to close the gap.',
    accent: 'from-blue-500/15 to-cyan-500/5',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    available: true,
  },
  {
    icon: BarChart3,
    title: 'Learning Roadmap',
    description:
      'Get a day-by-day study plan tailored to your gap skills and timeline. The AI builds a structured path with resources and milestones.',
    accent: 'from-emerald-500/15 to-teal-500/5',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    available: true,
  },
  {
    icon: BookOpen,
    title: 'Quiz Practice',
    description:
      'Sharpen your knowledge with AI-generated MCQs and coding challenges targeted at your exact skill gaps.',
    accent: 'from-amber-500/15 to-orange-500/5',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    available: false,
  },
  {
    icon: Mic,
    title: 'Mock Interview',
    description:
      'Practice technical and HR rounds with an AI interviewer that adapts questions to the role you're targeting.',
    accent: 'from-rose-500/15 to-pink-500/5',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10',
    available: false,
  },
  {
    icon: MessageSquare,
    title: 'Debate Arena',
    description:
      'Sharpen your communication and critical thinking by debating technical topics with an AI opponent.',
    accent: 'from-fuchsia-500/15 to-purple-500/5',
    iconColor: 'text-fuchsia-500',
    iconBg: 'bg-fuchsia-500/10',
    available: false,
  },
]

const steps = [
  {
    number: '01',
    title: 'Upload your resume',
    description: 'Drop your PDF. We extract the text in your browser — the file never leaves your device.',
  },
  {
    number: '02',
    title: 'Run skill gap analysis',
    description: 'Paste any job description. Our CrewAI agents compare it against your resume and score the match.',
  },
  {
    number: '03',
    title: 'Get your roadmap',
    description: 'One click turns your skill gaps into a day-by-day learning plan with resources and milestones.',
  },
]

const stats = [
  { value: '3', label: 'AI agents working in parallel' },
  { value: '100%', label: 'Browser-side PDF parsing' },
  { value: '0', label: 'Files stored on our servers' },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="gradient-mesh min-h-svh">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg gradient-brand">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">AI Study</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">
                Get started
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28">
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-1/2 size-64 -translate-y-1/2 rounded-full bg-violet-500/8 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 size-64 rounded-full bg-fuchsia-500/8 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="size-3.5" />
            Powered by CrewAI multi-agent system
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Land your dream job with{' '}
            <span className="text-gradient">AI-powered</span>
            {' '}interview prep
          </h1>

          {/* Sub */}
          <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Upload your resume, analyze skill gaps against any job description, and get a
            personalized day-by-day learning roadmap — all driven by intelligent AI agents.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild className="h-11 px-6 text-base">
              <Link to="/signup">
                Start for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 px-6 text-base">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          {/* Social proof pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {['No credit card required', 'PDF never leaves your browser', 'Free to use'].map(
              (item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Hero visual — mock app card */}
        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur-sm">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400/60" />
                <div className="size-2.5 rounded-full bg-amber-400/60" />
                <div className="size-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <div className="flex-1 rounded-md bg-background/60 px-3 py-1 text-center text-xs text-muted-foreground">
                app.aistudy.io/skill-gap
              </div>
            </div>
            {/* Mock content */}
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <div className="gradient-brand rounded-xl p-4 text-white shadow-lg">
                  <p className="text-xs font-medium text-white/70">Match score</p>
                  <p className="mt-1 text-4xl font-bold tabular-nums">78<span className="text-lg font-normal text-white/60"> / 100</span></p>
                  <p className="mt-2 text-xs text-white/80">Strong backend fundamentals. Prioritize TypeScript and system design to close the gap.</p>
                </div>
              </div>
              {[
                { label: 'Matching skills', items: ['Python', 'REST APIs', 'React', 'Git'], color: 'emerald' },
                { label: 'Critical gaps', items: ['TypeScript', 'Kubernetes', 'System Design'], color: 'red' },
                { label: 'Preferred gaps', items: ['GraphQL', 'AWS', 'Next.js'], color: 'amber' },
              ].map((col) => (
                <div
                  key={col.label}
                  className={cn(
                    'rounded-xl border p-3',
                    col.color === 'emerald' && 'border-emerald-500/20 bg-emerald-500/5',
                    col.color === 'red' && 'border-red-500/20 bg-red-500/5',
                    col.color === 'amber' && 'border-amber-500/20 bg-amber-500/5',
                  )}
                >
                  <p className="mb-2 text-xs font-semibold text-foreground/80">{col.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {col.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Glow under card */}
          <div className="pointer-events-none absolute inset-x-8 -bottom-4 h-8 rounded-full bg-primary/20 blur-xl" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-card/40 px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From resume to roadmap in minutes
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col gap-4">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(100%+0.75rem)] top-5 hidden h-px w-6 bg-border/80 sm:block" />
                )}
                <div className="flex size-11 items-center justify-center rounded-xl gradient-brand shadow-md shadow-primary/20">
                  <span className="text-sm font-bold text-white">{step.number}</span>
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to ace the interview
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              A full suite of AI-powered tools — from resume parsing to mock interviews.
              Three are live today, more are on the way.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  'relative flex flex-col gap-4 rounded-2xl border bg-linear-to-br p-5 transition-shadow hover:shadow-md',
                  feature.accent,
                  !feature.available && 'opacity-70',
                )}
              >
                {!feature.available && (
                  <span className="absolute right-4 top-4 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Coming soon
                  </span>
                )}
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    feature.iconBg,
                    feature.iconColor,
                  )}
                >
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                {feature.available && (
                  <div className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    Available now
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="gradient-brand relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-primary/25 sm:p-12">
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-8 left-8 size-48 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="size-3.5" />
                  Free to get started
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Ready to land your next role?
                </h2>
                <p className="max-w-md text-sm text-white/80">
                  Join and start with your resume upload — the full skill gap analysis and
                  roadmap generator are waiting.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                <Button
                  size="lg"
                  asChild
                  className="h-11 bg-white px-6 text-base text-primary hover:bg-white/90"
                >
                  <Link to="/signup">
                    Create free account
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="link" asChild className="h-auto p-0 text-white/70 hover:text-white">
                  <Link to="/login">Already have an account? Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-md gradient-brand">
              <Sparkles className="size-3 text-white" />
            </div>
            <span className="font-medium text-foreground">AI Study Platform</span>
          </div>
          <p>Built with CrewAI · FastAPI · React · Firebase</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
            <Link to="/signup" className="hover:text-foreground">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
