"use client"
import { useMemo, useState } from "react"
import { usePaginatedTeachers } from "@/hooks/useTeachers"
import { useCourseInstances } from "@/hooks/useCourseInstances"
import { usePendingArchives } from "@/hooks/usePayments"
import TeachersTab from "@/components/tabs/TeachersTab"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import { Tables } from "@/types/database.types"

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

export default function TeachersPage() {
  const [page, setPage] = useState(1)
  const { teachers: allTeachers, total, isLoading: isTeacherLoading, mutate } = usePaginatedTeachers(page, PAGE_SIZE)
  const { data: pendingArchiveMap } = usePendingArchives()

  const teachers = useMemo(() =>
    (allTeachers || []).filter((teacher: Tables<"teachers">) => !teacher.archived),
    [allTeachers]
  )

  if (isTeacherLoading) return <div className="p-8 text-center text-gray-500">Loading Teachers Directory...</div>

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <TeachersTab
        teachers={teachers}
        onTeachersUpdate={() => mutate()}
        canAdd={true}
        showCourses={true}
        showStats={true}
        pendingArchiveIds={pendingArchiveMap?.teacher || new Set()}
      />

      <Pagination className="pt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious aria-disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))} />
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
            <PaginationNext aria-disabled={page >= totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}