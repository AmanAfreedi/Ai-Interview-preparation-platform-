import { LogOut, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { mainNavItems } from '@/config/navigation'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

function UserAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="gradient-brand flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
      {initial}
    </div>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? 'User'

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent">
              <Link to="/dashboard">
                <div className="gradient-brand flex aspect-square size-8 items-center justify-center rounded-lg text-white shadow-lg shadow-primary/30">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AI Study</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    Interview Prep
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'h-10 rounded-lg transition-all',
                        isActive &&
                          'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
                      )}
                    >
                      <Link to={item.href}>
                        <item.icon className={cn(isActive && 'text-current')} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="bg-sidebar-border" />
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
          <UserAvatar name={displayName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {user?.email}
            </p>
          </div>
        </div>
        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              tooltip="Sign out"
              className="rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

type MobileHeaderProps = {
  title: string
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const { signOut } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:hidden">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => signOut()}
      >
        <LogOut className="size-4" />
        <span className="sr-only">Sign out</span>
      </Button>
    </header>
  )
}
