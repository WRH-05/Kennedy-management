"use client"

import { useStudentsPayments, useTeachersPayments } from "@/hooks/usePayments"
import PayoutsTab from "@/components/tabs/PayoutsTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Users } from "lucide-react"

export default function PayoutsPage() {
  const { payments: studentsPayouts, isLoading: studentLoading, mutate: mutateStudents } = useStudentsPayments();
  const { payments: teachersPayouts, isLoading: teachersLoading, mutate: mutateTeachers } = useTeachersPayments();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="teachers" className="w-full">
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
          {
            !teachersLoading || !teachersPayouts ?
              (
                <div className="p-8 text-center text-gray-500">
                  Loading Teacher Records...
                </div>
              ) :
              (
                <PayoutsTab
                  payoutData={teachersPayouts} // ✨ Directly uses your hook state data
                  type="teacher"
                />
              )
          }
        </TabsContent>


        <TabsContent value="students" className="mt-4">
          {
            !studentLoading || !studentsPayouts ?

              (
                <div className="p-8 text-center text-gray-500">
                  Loading Student Records...
                </div>
              ) :
              (
                <PayoutsTab
                  payoutData={studentsPayouts} // ✨ Directly uses your hook state data
                  type="student"
                />
              )
          }
        </TabsContent>

      </Tabs>
    </div>
  )
}