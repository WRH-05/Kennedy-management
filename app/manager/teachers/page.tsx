"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { usePaginatedTeachers } from "@/hooks/useTeachers"
import { usePendingArchives } from "@/hooks/usePayments"
import TeachersTab from "@/components/tabs/TeachersTab"
import { revalidateData } from "@/hooks/swr-config"
import { Tables } from "@/types/database.types"

const PAGE_SIZE = 10
const ALL = "all"

export default function TeachersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Teachers Directory...</div>}>
      <TeachersPageContent />
    </Suspense>
  )
}

function TeachersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const setPage = (n: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (n <= 1) params.delete("page")
    else params.set("page", String(n))
    const qs = params.toString()
    router.replace(qs ? `/manager/teachers?${qs}` : "/manager/teachers", { scroll: false })
  }

  const { teachers: allTeachers, isLoading, mutate } = usePaginatedTeachers(1, 0)
  const { data: pendingArchiveMap } = usePendingArchives()

  const [subjectFilter, setSubjectFilter] = useState<string>(ALL)

  const teacherList = useMemo(
    () => (allTeachers || []).filter((teacher: Tables<"teachers">) => !teacher.archived),
    [allTeachers]
  )

  const subjectOptions = useMemo(() => {
    const names = new Set<string>()
    for (const t of teacherList) {
      for (const tce of t.teachers_course_eligibility || []) {
        const name = tce.course_eligibility?.courses?.name
        if (name) names.add(name)
      }
    }
    return Array.from(names).sort()
  }, [teacherList])

  const filtered = useMemo(() => {
    if (subjectFilter === ALL) return teacherList
    return teacherList.filter((t) =>
      (t.teachers_course_eligibility || []).some((tce) => tce.course_eligibility?.courses?.name === subjectFilter)
    )
  }, [teacherList, subjectFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  const handleSubjectFilter = (v: string) => { setSubjectFilter(v); setPage(1) }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Teachers Directory...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TeachersTab
        teachers={paginated}
        subjectFilter={subjectFilter}
        onSubjectFilterChange={handleSubjectFilter}
        subjectOptions={subjectOptions}
        onTeachersUpdate={() => { mutate(); revalidateData('teachers') }}
        canAdd={true}
        showCourses={true}
        showStats={true}
        pendingArchiveIds={pendingArchiveMap?.teacher || new Set()}
      />

      {totalPages > 1 && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={currentPage <= 1}
                onClick={() => { if (currentPage > 1) setPage(currentPage - 1) }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                aria-disabled={currentPage >= totalPages}
                onClick={() => { if (currentPage < totalPages) setPage(currentPage + 1) }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
