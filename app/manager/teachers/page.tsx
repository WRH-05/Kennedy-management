"use client"

import { useMemo } from "react"
import { usePaginatedTeachers } from "@/hooks/useTeachers"
import { usePendingArchives } from "@/hooks/usePayments"
import TeachersTab from "@/components/tabs/TeachersTab"
import { Tables } from "@/types/database.types"
import { revalidateData } from "@/hooks/swr-config"

export default function TeachersPage() {
  const { teachers: allTeachers, isLoading, mutate } = usePaginatedTeachers(1, 0)
  const { data: pendingArchiveMap } = usePendingArchives()

  const teachers = useMemo(() =>
    (allTeachers || []).filter((teacher: Tables<"teachers">) => !teacher.archived),
    [allTeachers]
  )

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Teachers Directory...</div>

  return (
    <div className="space-y-6">
      <TeachersTab
        teachers={teachers}
        onTeachersUpdate={() => { mutate(); revalidateData('teachers') }}
        canAdd={true}
        showCourses={true}
        showStats={true}
        pendingArchiveIds={pendingArchiveMap?.teacher || new Set()}
      />
    </div>
  )
}
