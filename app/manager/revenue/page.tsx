"use client"
import { useRevenue } from "@/hooks/usePayments"
import RevenueTab from "@/components/tabs/RevenueTab"
import SummaryCards from "@/components/dashboard/SummaryCards"

export default function RevenuePage() {
  const { data: revenue, isLoading } = useRevenue()

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Revenue Data...</div>

  return (
    <div className="space-y-6">
      <SummaryCards />
      <RevenueTab revenue={revenue || []} />
    </div>
  )
}