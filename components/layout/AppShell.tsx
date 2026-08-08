"use client"

import { useAuth } from "@/context/AuthContext"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  // No sidebar/header on auth pages (before login)
  if (!user) {
    return <>{children}</>
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 w-full">
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
