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
  console.log(teachersPayouts)
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers")

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
            type="teacher"
          />
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <PayoutsTab
            payoutData={studentsPayouts} // ✨ Directly uses your hook state data
            type="student"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}