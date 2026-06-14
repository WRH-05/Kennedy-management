"use client"

import { useMemo } from "react"
import { useStudents } from "@/hooks/useStudents"
import { useCourses } from "@/hooks/useCourses"
import { usePendingArchives } from "@/hooks/usePayments"
import { revalidateData } from "@/hooks/swr-config"

import StudentsTab from "@/components/tabs/StudentsTab"
import SummaryCards from "@/components/dashboard/SummaryCards"

// Added a quick interface to avoid using 'any' on the student filter
interface Student {
  id: string | number
  name: string
  archived: boolean
  [key: string]: any
}

export default function StudentsPage() {
  const { students: allStudents, isLoading: studentLoading } = useStudents()
  const { courses, isLoading: courseLoading } = useCourses()
  const { data: pendingArchiveMap } = usePendingArchives()

  // Filter out archived students safely
  const students = useMemo(() =>
    (allStudents || []).filter((student: Student) => !student.archived),
    [allStudents]
  )

  if (studentLoading || courseLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Student Records...
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <StudentsTab
        students={students}
        courses={courses || []}
        onStudentsUpdate={() => revalidateData('students')}
        canAdd={true}
        showCourses={true}
        showPaymentStatus={true}
        pendingArchiveIds={pendingArchiveMap?.student || new Set()} // Fallback just in case map is undefined
      />
    </div>
  )
}