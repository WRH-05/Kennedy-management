"use client"

import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

export interface SortConfig {
  key: string
  direction: "ascending" | "descending" | null
}

interface SortControlsProps {
  sortConfig: SortConfig
  setSortConfig: (config: SortConfig) => void
  columns: { key: string; label: string }[]
}

export function SortControls({ sortConfig, setSortConfig, columns }: SortControlsProps) {
  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" | null = "ascending"

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending"
      } else if (sortConfig.direction === "descending") {
        direction = null
      }
    }

    setSortConfig({ key: direction ? key : "", direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="h-4 w-4" />
    }

    if (sortConfig.direction === "ascending") {
      return <ChevronUp className="h-4 w-4" />
    } else if (sortConfig.direction === "descending") {
      return <ChevronDown className="h-4 w-4" />
    }

    return <ChevronsUpDown className="h-4 w-4" />
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Sort by:</span>
      {columns.map((column) => (
        <Button
          key={column.key}
          variant={sortConfig.key === column.key ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort(column.key)}
          className="flex items-center space-x-1"
        >
          <span>{column.label}</span>
          {getSortIcon(column.key)}
        </Button>
      ))}
    </div>
  )
}
