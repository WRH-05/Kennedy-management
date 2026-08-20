"use client"
import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCourseInstances } from "@/hooks/useCourseInstances"

import CourseInstancesTab, { type CourseInstanceSort } from "@/components/tabs/CoursesInstancesTab"
import { getCourseDisplayName } from "@/lib/course-display"
import { minutesUntilNextSession } from "@/lib/schedule"
import { revalidateData } from "@/hooks/swr-config"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"

const PAGE_SIZE = 10

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Class Instances...</div>}>
      <CoursesPageContent />
    </Suspense>
  )
}

function CoursesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const [sort, setSort] = useState<CourseInstanceSort>('default')
  const { data: allCourses, isLoading: isCourseLoading, mutate } = useCourseInstances()

  const setPage = (n: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (n <= 1) params.delete("page")
    else params.set("page", String(n))
    const qs = params.toString()
    router.replace(qs ? `/manager/course-instances?${qs}` : "/manager/course-instances", { scroll: false })
  }

  const sortedCourses = useMemo(() => {
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

  const handleSortChange = (value: CourseInstanceSort) => {
    setSort(value)
    setPage(1)
  }

  if (isCourseLoading) return <div className="p-8 text-center text-gray-500">Loading Class Instances...</div>

  const total = sortedCourses.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const courseInstances = sortedCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <CourseInstancesTab
        courseInstances={courseInstances}
        onCoursesUpdate={() => { mutate(); revalidateData('course-instances') }}
        canAdd={true}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {totalPages > 1 && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={page <= 1}
                onClick={() => { if (page > 1) setPage(page - 1) }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 text-sm font-medium text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                aria-disabled={page >= totalPages}
                onClick={() => { if (page < totalPages) setPage(page + 1) }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
