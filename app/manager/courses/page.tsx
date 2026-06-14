"use client"
import { useMemo, useState } from "react"
import { usePaginatedCourses } from "@/hooks/useCourses"
import { useStudents } from "@/hooks/useStudents"
import { useTeachers } from "@/hooks/useTeachers"
import { usePendingArchives } from "@/hooks/usePayments"
import CoursesTab from "@/components/tabs/CoursesTab"
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

export default function CoursesPage() {
  const [page, setPage] = useState(1)
  const { courses: allCourses, total, isLoading: isCourseLoading, mutate } = usePaginatedCourses(page, PAGE_SIZE)
  const { students: allStudents, isLoading: isStudentLoading } = useStudents()
  const { teachers: allTeachers, isLoading: isTeacherLoading } = useTeachers()
  const { data: pendingArchiveMap } = usePendingArchives()

  const students = useMemo(() => (allStudents || []).filter((s: any) => !s.archived), [allStudents])
  const teachers = useMemo(() => (allTeachers || []).filter((t: any) => !t.archived), [allTeachers])
  const courses = useMemo(() => (allCourses || []).filter((c: any) => !c.archived), [allCourses])

  if (isStudentLoading || isTeacherLoading || isCourseLoading) return <div className="p-8 text-center text-gray-500">Loading Courses Directory...</div>

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <CoursesTab 
        courses={courses}
        teachers={teachers}
        students={students}
        onCoursesUpdate={() => mutate()}
        canAdd={true}
        pendingArchiveIds={pendingArchiveMap?.course || new Set()}
      />

      <Pagination className="pt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))} />
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
            <PaginationNext disabled={page >= totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}