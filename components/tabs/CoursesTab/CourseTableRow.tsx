// CourseTableRow.tsx
"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/types/database.types"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { UpdateCourseDialog } from "./UpdateCourseDialog"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CourseTableRowProps {
  course: Tables<"courses">,
  onCourseUpdated: () => void
}

export function CourseTableRow({ course, onCourseUpdated }: CourseTableRowProps) {
  // Move dialog state up to control it cleanly from the dropdown click
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const router = useRouter()

  return (
    <>
      <TableRow className="group">
        <TableCell>
          <Badge variant={course.type === "academic" ? "default" : "secondary"}>
            {course.type}
          </Badge>
        </TableCell>

        <TableCell>
          <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-left"
                    onClick={() => router.push(`/course/${course.id}`)}
                  >
                   {course.name}
                  </Button>
          
        </TableCell>
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
                Update Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Render the dialog outside the table row / dropdown flow completely */}
      <UpdateCourseDialog 
        course={course} 
        onCourseUpdated={onCourseUpdated} 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}