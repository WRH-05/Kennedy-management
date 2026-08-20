"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { usePaginatedGradeLevels } from "@/hooks/useGradeLevels"
import GradeLevelTab from "@/components/tabs/GradeLevelsTab"
import { revalidateData } from "@/hooks/swr-config"

const PAGE_SIZE = 10

export default function GradeLevelsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Courses Records...</div>}>
      <GradeLevelsPageContent />
    </Suspense>
  )
}

function GradeLevelsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const setPage = (n: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (n <= 1) params.delete("page")
    else params.set("page", String(n))
    const qs = params.toString()
    router.replace(qs ? `/manager/gradeLevels?${qs}` : "/manager/gradeLevels", { scroll: false })
  }

  const { gradeLevels, total, isLoading: coursesLoading, mutate } = usePaginatedGradeLevels(page, PAGE_SIZE)

  if (coursesLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Courses Records...
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <GradeLevelTab
        gradeLevels={gradeLevels}
        onGradeLevelsUpdate={() => { mutate(); revalidateData('grade-levels') }}
        canAdd={true}
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
