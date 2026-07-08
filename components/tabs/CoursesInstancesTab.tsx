"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import { AddCourseDialog } from "./CourseInstancesTab/AddCourseInstanceDialog"
import { CourseInstanceTableRow } from "./CourseInstancesTab/CourseInstanceTableRow"
import { archiveService } from "@/services/archiveService"
import { useToast } from "@/hooks/use-toast"
import { Tables } from "@/types/database.types"
import { CourseInstanceWithEnrichment } from "@/services/courseInstancesService"

interface CourseIntancesTabProps {
  courseInstances: CourseInstanceWithEnrichment[]
  onCoursesUpdate: (courseInstances: CourseInstanceWithEnrichment[]) => void
  canAdd?: boolean
  pendingArchiveIds?: Set<string>
}

export default function CoursesTab({
  courseInstances,
  onCoursesUpdate,
  canAdd = false,
  pendingArchiveIds = new Set(),
}: CourseIntancesTabProps) {
  const { toast } = useToast()

  const handleArchiveCourse = async (courseId: number, courseName: string) => {
    try {
      await archiveService.createArchiveRequest("course", courseId, courseName)
      toast({
        title: "Archive request submitted",
        description: "Waiting for manager approval.",
      })
    } catch (error) {
      console.error("Error creating archive request:", error)
      toast({
        title: "Error",
        description: "Failed to create archive request.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            All courseInstances
          </CardTitle>
          {canAdd && (
            <AddCourseDialog 
              onCourseAdded={onCoursesUpdate} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-113.75 overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseInstances.map((course) => (
                <CourseInstanceTableRow
                  key={course.id}
                  course={course}
                  pendingArchiveIds={pendingArchiveIds}
                  onArchive={handleArchiveCourse}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}