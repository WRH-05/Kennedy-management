"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { authService } from "@/services/authService"
import { getAuthorizedNavigation, getActiveNavHref } from "@/lib/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading } = useAuth()

  const authorizedCards = getAuthorizedNavigation(profile?.role)
  const activeHref = getActiveNavHref(pathname)

  const handleSignOut = async () => {
    await authService.signOut()
    router.push("/")
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <Link href="/manager" className="flex items-center gap-2 px-2 py-3">
          <img
            src="/home.png"
            alt="Home"
            className="h-10 w-auto rounded group-data-[collapsible=icon]:hidden"
          />
          <span className="hidden group-data-[collapsible=icon]:inline-flex items-center justify-center h-10 w-10 rounded bg-sidebar-accent text-sidebar-accent-foreground font-bold text-sm">
            KM
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {loading || !profile ? (
              <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
              </>
            ) : (
              authorizedCards.map((card) => (
                <SidebarMenuItem key={card.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeHref === card.href}
                    tooltip={card.title}
                  >
                    <Link href={card.href}>
                      {card.icon}
                      <span>{card.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
