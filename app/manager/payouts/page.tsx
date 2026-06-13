"use client"
import { usePayouts } from "@/hooks/usePayments"
import { useAuth } from "@/contexts/AuthContext"
import { paymentService } from "@/services/paymentService"
import PayoutsTab from "@/components/tabs/PayoutsTab"
import SummaryCards from "@/components/dashboard/SummaryCards"

export default function PayoutsPage() {
  const { data: payouts, isLoading, mutate } = usePayouts()
  const { user } = useAuth()

  const approvePayout = async (payoutId: number) => {
    try {
      const approverName = user?.profile?.full_name || 'Manager'
      await paymentService.updatePayoutStatus(payoutId.toString(), 'approved', approverName)
      mutate()
    } catch (error) {
      console.error('Error approving payout:', error)
    }
  }

  const denyPayout = async (payoutId: number) => {
    try {
      await paymentService.updatePayoutStatus(payoutId.toString(), 'denied', null)
      mutate()
    } catch (error) {
      console.error('Error denying payout:', error)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Payout Data...</div>

  return (
    <div className="space-y-6">
      <SummaryCards />
      <PayoutsTab payouts={payouts || []} onApprovePayout={approvePayout} onDenyPayout={denyPayout} />
    </div>
  )
}