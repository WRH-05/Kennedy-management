"use client"

import { useMemo, useState } from "react"
import { usePaginatedStudents } from "@/hooks/useStudents"
import { usePendingArchives } from "@/hooks/usePayments"
import StudentsTab from "@/components/tabs/StudentsTab"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"

const PAGE_SIZE = 6

function getPageItems(page: number, totalPages: number) {
  const pages: Array<number | 'ellipsis'> = []

  if (totalPages <= 7) {
    for (let index = 1; index <= totalPages; index += 1) {
      pages.push(index)
    }
    return pages
  }

  const left = Math.max(2, page - 1)
  const right = Math.min(totalPages - 1, page + 1)

  pages.push(1)

  if (left > 2) {
    pages.push('ellipsis')
  }

  for (let index = left; index <= right; index += 1) {
    pages.push(index)
  }

  if (right < totalPages - 1) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)

  return pages
}

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const { students, total, isLoading: studentLoading, mutate } = usePaginatedStudents(page, PAGE_SIZE)
  const { data: pendingArchiveMap } = usePendingArchives()

  const studentList = useMemo(
    () => (students || []).filter((student: any) => !student.archived),
    [students]
  )

  if (studentLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Student Records...
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <StudentsTab
        students={studentList}
        onStudentsUpdate={() => mutate()}
        canAdd={true}
        showCourses={true}
        showPaymentStatus={true}
        pendingArchiveIds={pendingArchiveMap?.student || new Set()}
      />

      <Pagination className="pt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={page <= 1}
              onClick={() => {
                if (page > 1) {
                  setPage(page - 1)
                }
              }}
            />
          </PaginationItem>

          {getPageItems(page, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  isActive={item === page}
                  onClick={() => setPage(item)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              aria-disabled={page >= totalPages}
              onClick={() => {
                if (page < totalPages) {
                  setPage(page + 1)
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}