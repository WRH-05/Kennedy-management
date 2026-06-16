"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import { AddCourseDialog } from "./CourseTab/AddCourseDialog"
import { CourseTableRow } from "./CourseTab/CourseTableRow"
import { archiveService } from "@/services/archiveService"
import { useToast } from "@/hooks/use-toast"

interface CoursesTabProps {
  courses: any[]
  teachers: any[]
  students: any[]
  onCoursesUpdate: (courses: any[]) => void
  canAdd?: boolean
  pendingArchiveIds?: Set<string>
}

export default function CoursesTab({
  courses,
  teachers,
  students,
  onCoursesUpdate,
  canAdd = false,
  pendingArchiveIds = new Set(),
}: CoursesTabProps) {
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
            All Courses
          </CardTitle>
          {canAdd && (
            <AddCourseDialog 
              teachers={teachers} 
              students={students} 
              onCourseAdded={onCoursesUpdate} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[455px] overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <CourseTableRow
                  key={course.id}
                  course={course}
                  students={students}
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