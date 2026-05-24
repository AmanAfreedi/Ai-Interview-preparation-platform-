import { Outlet, useLocation } from 'react-router-dom'

import { AppSidebar, MobileHeader } from '@/components/layout/app-sidebar'
import { getPageDescription, getPageTitle } from '@/config/navigation'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export function DashboardLayout() {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  const pageDescription = getPageDescription(location.pathname)

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="gradient-mesh">
          <MobileHeader title={pageTitle} />
          <header className="hidden shrink-0 items-center gap-3 border-b border-border/60 bg-background/70 px-6 py-4 backdrop-blur-md md:flex">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5" />
            <div>
              <p className="text-sm font-medium">{pageTitle}</p>
              {pageDescription && (
                <p className="text-xs text-muted-foreground">{pageDescription}</p>
              )}
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
