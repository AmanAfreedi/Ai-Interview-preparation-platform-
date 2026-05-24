import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Target,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard'
  const item = mainNavItems.find((nav) => nav.href === pathname)
  return item?.title ?? 'AI Study'
}

export function getPageDescription(pathname: string): string | undefined {
  if (pathname === '/dashboard') {
    return 'Your interview preparation command center'
  }
  const item = mainNavItems.find((nav) => nav.href === pathname)
  return item?.description
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Track your interview prep progress',
  },
  {
    title: 'Resume',
    href: '/resume',
    icon: FileText,
    description: 'Upload and manage your resume',
  },
  {
    title: 'Skill Gap',
    href: '/skill-gap',
    icon: Target,
    description: 'Compare resume vs job description',
  },
  {
    title: 'Roadmap',
    href: '/roadmap',
    icon: BarChart3,
    description: 'AI-generated preparation plan',
  },
  {
    title: 'Quiz',
    href: '/quiz',
    icon: BookOpen,
    description: 'MCQs and coding practice',
  },
  {
    title: 'Mock Interview',
    href: '/mock-interview',
    icon: Mic,
    description: 'Technical and HR practice',
  },
  {
    title: 'Debate Arena',
    href: '/debate',
    icon: MessageSquare,
    description: 'Improve communication with AI',
  },
]
