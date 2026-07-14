"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Archive } from "lucide-react"
import { useMemo } from "react"
import { useCourseEnrollementStudentsByCourseId } from "@/hooks/useCourseEnrollement"

interface CourseInstanceTableRowProps {
  course: any
  pendingArchiveIds: Set<string>
  onArchive: (courseId: string, courseName: string) => void
}

export function CourseInstanceTableRow({ course, pendingArchiveIds, onArchive }: CourseInstanceTableRowProps) {
  const router = useRouter()
  const { students: allStudents, isLoading } = useCourseEnrollementStudentsByCourseId(course.id);
  const students = useMemo(() => {
    const list = Array.isArray(allStudents) ? allStudents : allStudents.data;
    return list;
  }, [allStudents]);
  const isArchiveDisabled = pendingArchiveIds.has(course.id)
  return (
    <TableRow className="group">
      <TableCell>
        <div className={`w-3 h-3 rounded-full ${course.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
      </TableCell>

      <TableCell className="font-medium">
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-left"
          onClick={() => router.push(`/course-instance/${course.id}`)}
        >
          {course.subject} - {course.school_year}
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

      <TableCell>
        <Badge variant={course.course_type === "Group" ? "default" : "secondary"}>
          {course.course_type}
        </Badge>
      </TableCell>

      <TableCell>{students.length} students</TableCell>

      <TableCell>
        <div className="flex items-center justify-between">
          <span>
            {course.price} DA {course.course_type === "Group" ? "/month" : "/session"}
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
              <DropdownMenuItem
                onClick={() => onArchive(course.id, `${course.subject} - ${course.school_year}`)}
                className={isArchiveDisabled ? "text-gray-400 cursor-not-allowed" : "text-orange-600"}
                disabled={isArchiveDisabled}
              >
                <Archive className="mr-2 h-4 w-4" />
                {isArchiveDisabled ? "Archive Pending" : "Archive"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}