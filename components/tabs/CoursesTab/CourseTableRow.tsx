// CourseTableRow.tsx
"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Tables } from "@/types/database.types"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { UpdateCourseDialog } from "./UpdateCourseDialog"
import { coursesService } from "@/services/coursesService"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCourseType } from "@/lib/course-display"

const supabase = createClient()

interface CourseTableRowProps {
  course: Tables<"courses">,
  onCourseUpdated: () => void
}

export function CourseTableRow({ course, onCourseUpdated }: CourseTableRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Check for dependent records in course_eligibility
      const { count, error: checkError } = await supabase
        .from('course_eligibility')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)

      if (checkError) throw checkError

      if (count && count > 0) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete this course because it is assigned to active course instances.",
          variant: "destructive",
        })
        return
      }

      await coursesService.deleteCourse(course.id)
      toast({
        title: "Course deleted",
        description: `${course.name} has been successfully deleted.`,
      })
      onCourseUpdated()
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setTimeout(() => {
        document.body.style.pointerEvents = ''
      }, 100)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setShowDeleteDialog(open)
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = ''
      }, 100)
    }
  }

  return (
    <>
      <TableRow className="group">
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
          <span className="text-sm text-muted-foreground">{formatCourseType(course.type)}</span>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={(e) => {
                e.preventDefault()
                setIsDialogOpen(true)
              }}>
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setShowDeleteDialog(true)
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <UpdateCourseDialog
        course={course}
        onCourseUpdated={onCourseUpdated}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{course.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
