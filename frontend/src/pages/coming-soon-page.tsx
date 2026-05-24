import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { mainNavItems } from '@/config/navigation'

type ComingSoonPageProps = {
  title: string
  description?: string
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  const navItem = mainNavItems.find((item) => item.title === title)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={title}
        description={
          description ?? navItem?.description ?? 'Coming in a future release.'
        }
      />

      <Card className="max-w-xl border-dashed border-primary/30 bg-card/80 shadow-sm">
        <CardHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Construction className="size-6" />
          </div>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            This feature will connect to the FastAPI backend and CrewAI agents
            once API integration begins. The UI shell is ready — backend wiring
            is next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
