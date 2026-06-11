"use client"
import { useMemo } from "react"
import { useDashboardData, usePendingArchives, revalidateData } from "@/hooks/useData"
import TeachersTab from "@/components/tabs/TeachersTab"
import SummaryCards from "@/components/dashboard/SummaryCards"

export default function TeachersPage() {
  const { teachers: allTeachers, courses, isLoading } = useDashboardData()
  const { data: pendingArchiveMap } = usePendingArchives()

  const teachers = useMemo(() => 
    (allTeachers || []).filter((teacher: any) => !teacher.archived), 
    [allTeachers]
  )

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Teachers Directory...</div>

  return (
    <div className="space-y-6">
      <SummaryCards />
      <TeachersTab 
        teachers={teachers}
        courses={courses || []}
        onTeachersUpdate={() => revalidateData('teachers')}
        canAdd={true}
        showCourses={true}
        showStats={true}
        pendingArchiveIds={pendingArchiveMap?.teacher || new Set()}
      />
    </div>
  )
}