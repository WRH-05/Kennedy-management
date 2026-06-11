"use client"
import { useMemo } from "react"
import { useDashboardData, usePendingArchives, revalidateData } from "@/hooks/useData"
import CoursesTab from "@/components/tabs/CoursesTab"
import SummaryCards from "@/components/dashboard/SummaryCards"

export default function CoursesPage() {
  const { students: allStudents, teachers: allTeachers, courses: allCourses, isLoading } = useDashboardData()
  const { data: pendingArchiveMap } = usePendingArchives()

  const students = useMemo(() => (allStudents || []).filter((s: any) => !s.archived), [allStudents])
  const teachers = useMemo(() => (allTeachers || []).filter((t: any) => !t.archived), [allTeachers])
  const courses = useMemo(() => (allCourses || []).filter((c: any) => !c.archived), [allCourses])

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Courses Directory...</div>

  return (
    <div className="space-y-6">
      <SummaryCards />
      <CoursesTab 
        courses={courses}
        teachers={teachers}
        students={students}
        onCoursesUpdate={() => revalidateData('courses')}
        canAdd={true}
        pendingArchiveIds={pendingArchiveMap?.course || new Set()}
      />
    </div>
  )
}