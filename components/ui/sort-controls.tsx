"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export interface SortConfig {
  key: string
  direction: "asc" | "desc" | null
}

interface SortControlsProps {
  sortKey: string
  currentSort: SortConfig
  onSort: (key: string) => void
  label: string
}

export function SortControls({ sortKey, currentSort, onSort, label }: SortControlsProps) {
  const isActive = currentSort.key === sortKey
  const direction = isActive ? currentSort.direction : null

  const getIcon = () => {
    if (!isActive || direction === null) return <ArrowUpDown className="h-4 w-4" />
    if (direction === "asc") return <ArrowUp className="h-4 w-4" />
    return <ArrowDown className="h-4 w-4" />
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => onSort(sortKey)} className="h-8 px-2 lg:px-3">
      {label}
      {getIcon()}
    </Button>
  )
}
