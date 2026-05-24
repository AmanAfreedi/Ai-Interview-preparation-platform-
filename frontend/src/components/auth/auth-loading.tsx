import { Skeleton } from '@/components/ui/skeleton'

export function AuthLoading() {
  return (
    <div className="gradient-mesh flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  )
}
