"use client"

import { useTeachersPayments } from "@/hooks/usePayments"
import PayoutsTab from "@/components/tabs/PayoutsTab"

export default function PayoutsPage() {
  const { payments: teachersPayouts, isLoading: teachersLoading, mutate: mutateTeachers } = useTeachersPayments();

  return (
    <div className="space-y-6">
      {teachersLoading ? (
        <div className="p-8 text-center text-gray-500">Loading Teacher Payout Records...</div>
      ) : !teachersPayouts ? (
        <div className="p-8 text-center text-gray-500">No teacher payout records found.</div>
      ) : (
        <PayoutsTab
          payoutData={teachersPayouts}
          type="teacher"
          onPageChange={() => mutateTeachers()}
        />
      )}
    </div>
  )
}
