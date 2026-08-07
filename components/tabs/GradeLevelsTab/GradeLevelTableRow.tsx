// GradeLevelTableRow.tsx
"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/types/database.types"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { UpdateGradeLevelDialog } from "./UpdateGradeLevelsDialog"
import { useState } from "react"

interface GradeLevelTableRowProps {
  gradeLevel: Tables<"grade_levels">,
  onGradeLevelUpdated: () => void
}

export function GradeLevelTableRow({ gradeLevel: gradeLevel, onGradeLevelUpdated: onGradeLevelUpdated }: GradeLevelTableRowProps) {
  // Move dialog state up to control it cleanly from the dropdown click
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <TableRow className="group">
        <TableCell>{gradeLevel.name}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Force the dropdown item to act as the dialog trigger */}
              <DropdownMenuItem onSelect={(e) => {
                e.preventDefault() // Prevents focus-loss issues
                setIsDialogOpen(true)
              }}>
                Update Grade Level
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Render the dialog outside the table row / dropdown flow completely */}
      <UpdateGradeLevelDialog
        GradeLevel={gradeLevel}
        onGradeLevelUpdated={onGradeLevelUpdated}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}