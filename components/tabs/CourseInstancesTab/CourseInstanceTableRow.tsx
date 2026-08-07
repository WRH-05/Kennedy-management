"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Archive } from "lucide-react"
import { useMemo } from "react"
import { useCourseEnrollementStudentsByCourseId } from "@/hooks/useCourseEnrollement"
import { CourseInstance } from "@/services/courseInstancesService"

interface CourseInstanceTableRowProps {
  course: CourseInstance
  pendingArchiveIds: Set<string>
  onArchive: (courseId: string, courseName: string) => void
}

export function CourseInstanceTableRow({ course, pendingArchiveIds, onArchive }: CourseInstanceTableRowProps) {
  const router = useRouter()
  return (
    <TableRow className="group">

      <TableCell className="font-medium">
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-left"
          onClick={() => router.push(`/course-instance/${course.id}`)}
        >
          {course.course_eligibility.courses.name} - {course.course_eligibility.grade_levels?.name}
        </Button>
      </TableCell>

      <TableCell>
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-left"
          onClick={() => router.push(`/teacher/${course.teacher_id}`)}
        >
          {course.teachers.name}
        </Button>
      </TableCell>


      <TableCell>{course.course_enrollments.filter((ce) => ce.status == 'enrolled').length} students</TableCell>

      <TableCell>
        <div className="flex items-center justify-between">
          <span>
            {course.price} DA
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/course-instance/${course.id}`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}