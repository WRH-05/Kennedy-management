"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Archive } from "lucide-react"
import { CourseInstance } from "@/services/courseInstancesService"
import { UpdateCourseInstanceDialog } from "./UpdateCourseInstanceDialog"
import { getCourseDisplayName } from "@/lib/course-display"
import { archiveService } from "@/services/archiveService"
import { toast } from "@/hooks/use-toast"

interface CourseInstanceTableRowProps {
  course: CourseInstance
  onCourseInstanceUpdated: () => void
}

export function CourseInstanceTableRow({ course, onCourseInstanceUpdated }: CourseInstanceTableRowProps) {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleArchive = async () => {
    try {
      await archiveService.createArchiveRequest("course", course.id, getCourseDisplayName(course))
      toast({ title: "Archive request submitted", description: "Waiting for manager approval." })
      onCourseInstanceUpdated()
    } catch (error) {
      toast({ title: "Error", description: (error as Error)?.message || "Failed to submit archive request.", variant: "destructive" })
    }
  }

  return (
    <>
      <TableRow className="group">
        <TableCell className="font-medium">
          <Button
            variant="link"
            className="p-0 h-auto font-medium text-left"
            onClick={() => router.push(`/course-instance/${course.id}`)}
          >
            {getCourseDisplayName(course)}
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
            <span>{course.price} DA</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditDialogOpen(true) }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
      <UpdateCourseInstanceDialog
        courseInstanceId={course.id}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdated={onCourseInstanceUpdated}
      />
    </>
  )
}
