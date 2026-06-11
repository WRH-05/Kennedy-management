"use client"
import { useMemo } from "react"
import { useDashboardData, usePendingArchives, revalidateData } from "@/hooks/useData"
import StudentsTab from "@/components/tabs/StudentsTab"
import SummaryCards from "@/components/dashboard/SummaryCards"

export default function StudentsPage() {
  const { students: allStudents, courses, isLoading } = useDashboardData()
  const { data: pendingArchiveMap } = usePendingArchives()

  const students = useMemo(() => 
    (allStudents || []).filter((student: any) => !student.archived), 
    [allStudents]
  )

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Student Records...</div>

  return (
    <div className="space-y-6">
      <SummaryCards />
      <StudentsTab 
        students={students}
        courses={courses || []}
        onStudentsUpdate={() => revalidateData('students')}
        canAdd={true}
        showCourses={true}
        showPaymentStatus={true}
        pendingArchiveIds={pendingArchiveMap.student}
      />
    </div>
  )
}