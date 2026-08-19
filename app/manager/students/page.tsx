"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { usePaginatedStudents } from "@/hooks/useStudents"
import { usePendingArchives } from "@/hooks/usePayments"
import StudentsTab from "@/components/tabs/StudentsTab"
import { revalidateData } from "@/hooks/swr-config"
import { Tables } from "@/types/database.types"

const PAGE_SIZE = 10
const ALL = "all"

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Student Records...</div>}>
      <StudentsPageContent />
    </Suspense>
  )
}

function StudentsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const setPage = (n: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (n <= 1) params.delete("page")
    else params.set("page", String(n))
    const qs = params.toString()
    router.replace(qs ? `/manager/students?${qs}` : "/manager/students", { scroll: false })
  }

  const { students, isLoading, mutate } = usePaginatedStudents(1, 0)
  const { data: pendingArchiveMap } = usePendingArchives()

  const [gradeFilter, setGradeFilter] = useState<string>(ALL)
  const [feeFilter, setFeeFilter] = useState<string>(ALL)

  const studentList = useMemo(
    () => (students || []).filter((student: Tables<"students">) => !student.archived),
    [students]
  )

  const filtered = useMemo(() => {
    return studentList.filter((student) => {
      if (gradeFilter !== ALL) {
        const inGrade = student.school_level === gradeFilter
          || (student.extracurricular_grade_level_ids || []).includes(gradeFilter)
        if (!inGrade) return false
      }
      if (feeFilter !== ALL) {
        const wantPaid = feeFilter === "paid"
        if (student.registration_fee_paid !== wantPaid) return false
      }
      return true
    })
  }, [studentList, gradeFilter, feeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  const handleGradeFilter = (v: string) => { setGradeFilter(v); setPage(1) }
  const handleFeeFilter = (v: string) => { setFeeFilter(v); setPage(1) }

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
        students={paginated}
        gradeFilter={gradeFilter}
        onGradeFilterChange={handleGradeFilter}
        feeFilter={feeFilter}
        onFeeFilterChange={handleFeeFilter}
        onStudentsUpdate={() => { mutate(); revalidateData('students') }}
        canAdd={true}
        showPaymentStatus={true}
        pendingArchiveIds={pendingArchiveMap?.student || new Set()}
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
