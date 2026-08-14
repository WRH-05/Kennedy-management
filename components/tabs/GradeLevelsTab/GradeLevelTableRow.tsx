// GradeLevelTableRow.tsx
"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Tables } from "@/types/database.types"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { UpdateGradeLevelDialog } from "./UpdateGradeLevelsDialog"
import { gradeLevelsService } from "@/services/gradeLevelsService"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCourseType } from "@/lib/course-display"

const supabase = createClient()

interface GradeLevelTableRowProps {
  gradeLevel: Tables<"grade_levels">,
  onGradeLevelUpdated: () => void
}

export function GradeLevelTableRow({ gradeLevel: gradeLevel, onGradeLevelUpdated: onGradeLevelUpdated }: GradeLevelTableRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Check for dependent records in course_eligibility
      const { count, error: checkError } = await supabase
        .from('course_eligibility')
        .select('*', { count: 'exact', head: true })
        .eq('grade_level_id', gradeLevel.id)

      if (checkError) throw checkError

      if (count && count > 0) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete this grade level because it has courses assigned to it.",
          variant: "destructive",
        })
        return
      }

      await gradeLevelsService.deleteGradeLevel(gradeLevel.id)
      toast({
        title: "Grade level deleted",
        description: `${gradeLevel.name} has been successfully deleted.`,
      })
      onGradeLevelUpdated()
    } catch (error) {
      console.error("Error deleting grade level:", error)
      toast({
        title: "Error",
        description: "Failed to delete grade level: " + (error as Error).message,
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
            onClick={() => router.push(`/grade-level/${gradeLevel.id}`)}
          >
            {gradeLevel.name}
          </Button>
        </TableCell>
        <TableCell>
          <Badge variant={gradeLevel.type === "academic" ? "default" : "secondary"}>
            {formatCourseType(gradeLevel.type)}
          </Badge>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={(e) => {
                e.preventDefault()
                setIsDialogOpen(true)
              }}>
                Edit Grade Level
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

      <UpdateGradeLevelDialog
        GradeLevel={gradeLevel}
        onGradeLevelUpdated={onGradeLevelUpdated}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grade Level</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{gradeLevel.name}&quot;? This action cannot be undone.
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
