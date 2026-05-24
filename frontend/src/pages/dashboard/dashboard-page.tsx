import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileText,
  MessageSquare,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const quickActions = [
  {
    title: 'Upload Resume',
    description: 'Add your PDF resume for AI analysis',
    href: '/resume',
    icon: FileText,
    accent: 'from-violet-500/15 to-indigo-500/5',
  },
  {
    title: 'Skill Gap Analysis',
    description: 'Compare your skills vs a job description',
    href: '/skill-gap',
    icon: Target,
    accent: 'from-blue-500/15 to-cyan-500/5',
  },
  {
    title: 'View Roadmap',
    description: 'See your personalized prep plan',
    href: '/roadmap',
    icon: BarChart3,
    accent: 'from-emerald-500/15 to-teal-500/5',
  },
  {
    title: 'Start Quiz',
    description: 'Practice MCQs and coding questions',
    href: '/quiz',
    icon: BookOpen,
    accent: 'from-amber-500/15 to-orange-500/5',
  },
  {
    title: 'Mock Interview',
    description: 'Technical or HR practice with AI',
    href: '/mock-interview',
    icon: Mic,
    accent: 'from-rose-500/15 to-pink-500/5',
  },
  {
    title: 'Debate Arena',
    description: 'Sharpen communication with AI debates',
    href: '/debate',
    icon: MessageSquare,
    accent: 'from-fuchsia-500/15 to-purple-500/5',
  },
]

const stats = [
  {
    label: 'Roadmaps',
    value: '—',
    icon: BarChart3,
    hint: 'Generated plans',
  },
  {
    label: 'Quizzes taken',
    value: '—',
    icon: BookOpen,
    hint: 'Practice sessions',
  },
  {
    label: 'Mock interviews',
    value: '—',
    icon: Mic,
    hint: 'Completed sessions',
  },
  {
    label: 'Avg. quiz score',
    value: '—',
    icon: TrendingUp,
    hint: 'Your performance',
  },
]

export function DashboardPage() {
  const { user, profile } = useAuth()
  const displayName =
    profile?.username ?? user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="gradient-brand relative overflow-hidden rounded-2xl p-6 text-white shadow-xl shadow-primary/20 sm:p-8">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              AI-powered prep
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {displayName}
            </h2>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Upload your resume, analyze skill gaps, and practice interviews —
              all in one place.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="w-fit bg-white text-primary hover:bg-white/90"
          >
            <Link to="/resume">
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <PageHeader
          title="Your progress"
          description="Stats will populate as you use the platform."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <stat.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <PageHeader
          title="Quick actions"
          description="Jump into the tools you need for your next interview."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href} className="group">
              <Card
                className={cn(
                  'h-full border-border/60 bg-gradient-to-br transition-all duration-200',
                  'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                  action.accent,
                )}
              >
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-background/80 text-primary shadow-sm ring-1 ring-border/50">
                    <action.icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                    <ArrowRight className="size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
