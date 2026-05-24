import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  subtitle: string
}

const highlights = [
  'AI skill gap analysis from your resume',
  'Personalized interview roadmaps',
  'Mock interviews with instant feedback',
  'Debate arena to sharpen communication',
]

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="gradient-brand relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div className="absolute -left-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 size-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">AI Study</p>
            <p className="text-sm text-white/75">Interview Prep Platform</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Prepare smarter. Interview with confidence.
          </h1>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-white/85"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-white" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          Built for students targeting their dream roles.
        </p>
      </div>

      <div className="gradient-mesh flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="gradient-brand flex size-9 items-center justify-center rounded-lg text-white">
                <Sparkles className="size-4" />
              </div>
              <span className="font-semibold">AI Study</span>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
