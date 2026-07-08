"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/types/database.types"

interface CourseTableRowProps {
  course: Tables<"courses">
}

export function CourseTableRow({ course }: CourseTableRowProps) {
  return (
    <TableRow className="group">
      <TableCell>
        <Badge variant={course.type === "academic" ? "default" : "secondary"}>
          {course.type}
        </Badge>
      </TableCell>

      <TableCell>{course.name} students</TableCell>
    </TableRow>
  )
}