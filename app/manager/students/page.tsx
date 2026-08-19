"use client"

import { useMemo } from "react"
import { usePaginatedStudents } from "@/hooks/useStudents"
import { usePendingArchives } from "@/hooks/usePayments"
import StudentsTab from "@/components/tabs/StudentsTab"
import { revalidateData } from "@/hooks/swr-config"
import { Tables } from "@/types/database.types"

export default function StudentsPage() {
  const { students, isLoading, mutate } = usePaginatedStudents(1, 0)
  const { data: pendingArchiveMap } = usePendingArchives()

  const studentList = useMemo(
    () => (students || []).filter((student: Tables<"students">) => !student.archived),
    [students]
  )

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Student Records...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StudentsTab
        students={studentList}
        onStudentsUpdate={() => { mutate(); revalidateData('students') }}
        canAdd={true}
        showPaymentStatus={true}
        pendingArchiveIds={pendingArchiveMap?.student || new Set()}
      />
    </div>
  )
}
