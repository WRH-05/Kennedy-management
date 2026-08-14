"use client"

import { usePathname } from "next/navigation"
import SummaryCards from "@/components/dashboard/SummaryCards"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isStats = pathname === "/manager/stats"

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!isStats && <SummaryCards />}
      {children}
    </div>
  )
}
