"use client"

import { useState } from "react"
import { useStudentsPayments, useTeachersPayments } from "@/hooks/usePayments" 
import { useAuth } from "@/contexts/AuthContext"
import { paymentService } from "@/services/paymentService"
import PayoutsTab from "@/components/tabs/PayoutsTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Users } from "lucide-react"

export default function PayoutsPage() {
  const { payments: studentsPayouts, isLoading: studentLoading, mutate: mutateStudents } = useStudentsPayments();
  const { payments: teachersPayouts, isLoading: teachersLoading, mutate: mutateTeachers } = useTeachersPayments();
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers")

  // Combine loading states safely
  const isLoading = studentLoading || teachersLoading;

  const approvePayout = async (payoutId: number) => {
    try {
      const approverName = user?.profile?.full_name || 'Manager'
      await paymentService.updatePayoutStatus(payoutId.toString(), 'approved', approverName)
      
      // Refresh the correct tab's data cache
      if (activeTab === "teachers") mutateTeachers()
      else mutateStudents()
    } catch (error) {
      console.error('Error approving payout:', error)
    }
  }

  const denyPayout = async (payoutId: number) => {
    try {
      await paymentService.updatePayoutStatus(payoutId.toString(), 'denied', null)
      
      // Refresh the correct tab's data cache
      if (activeTab === "teachers") mutateTeachers()
      else mutateStudents()
    } catch (error) {
      console.error('Error denying payout:', error)
    }
  }
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Payout Data...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="teachers" onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Teacher Payouts
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Payouts/Refunds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers" className="mt-4">
          <PayoutsTab
            payoutData={teachersPayouts} // ✨ Directly uses your hook state data
            onDenyPayout={denyPayout}
            type="teacher"
          />
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <PayoutsTab
            payoutData={studentsPayouts} // ✨ Directly uses your hook state data
            onDenyPayout={denyPayout}
            type="student"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}