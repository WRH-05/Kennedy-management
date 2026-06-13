"use client"
import { useMemo } from "react"
import { useTeachers } from "@/hooks/useTeachers"
import { useCourses } from "@/hooks/useCourses"
import { usePendingArchives } from "@/hooks/usePayments"
import { revalidateData } from "@/hooks/swr-config"
import TeachersTab from "@/components/tabs/TeachersTab"
import SummaryCards from "@/components/dashboard/SummaryCards"

export default function TeachersPage() {
  const { courses, isLoading: isCourseLoading } = useCourses()
  const { teachers: allTeachers, isLoading: isTeacherLoading } = useTeachers()
  const { data: pendingArchiveMap } = usePendingArchives()

  const teachers = useMemo(() =>
    (allTeachers || []).filter((teacher: any) => !teacher.archived),
    [allTeachers]
  )

  if (isCourseLoading || isTeacherLoading) return <div className="p-8 text-center text-gray-500">Loading Teachers Directory...</div>

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