"use client"
import { useMemo, useState } from "react"
import { usePaginatedCourseInstances } from "@/hooks/useCourseInstances"

import CourseInstancesTab from "@/components/tabs/CoursesInstancesTab"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCourseDisplayName } from "@/lib/course-display"
import { minutesUntilNextSession } from "@/lib/schedule"
import { revalidateData } from "@/hooks/swr-config"
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
  const [sort, setSort] = useState<'default' | 'closest' | 'name' | 'teacher'>('default')
  const { courseInstances: allCourses, total, isLoading: isCourseLoading, mutate } = usePaginatedCourseInstances(page, PAGE_SIZE)

  const courseInstances = useMemo(() => {
    const list = [...allCourses];
    if (sort === 'name') {
      list.sort((a, b) => getCourseDisplayName(a).localeCompare(getCourseDisplayName(b)))
    } else if (sort === 'teacher') {
      list.sort((a, b) => (a.teachers?.name || '').localeCompare(b.teachers?.name || ''))
    } else if (sort === 'closest') {
      list.sort((a, b) =>
        minutesUntilNextSession((a as any).course_schedule || []) - minutesUntilNextSession((b as any).course_schedule || [])
      )
    }
    return list;
  }, [allCourses, sort]);



  if (isCourseLoading) return <div className="p-8 text-center text-gray-500">Loading Course Instances...</div>

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={sort} onValueChange={(v) => setSort(v as 'default' | 'closest' | 'name' | 'teacher')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="closest">Closest to Happen</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CourseInstancesTab
        courseInstances={courseInstances}
        onCoursesUpdate={() => { mutate(); revalidateData('course-instances') }}
        canAdd={true}
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