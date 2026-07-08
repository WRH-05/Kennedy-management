"use client"

import { useState } from "react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import { usePaginatedGradeLevels } from "@/hooks/useGradeLevels"
import GradeLevelTab from "@/components/tabs/GradeLevelsTab"


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

export default function GradeLevelsPage() {
  const [page, setPage] = useState(1)
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
        onGradeLevelsUpdate={() => mutate()}
        canAdd={true}
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