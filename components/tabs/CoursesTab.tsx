"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import { AddCourseDialog } from "./CoursesTab/AddCourseDialog"
import { CourseTableRow } from "./CoursesTab/CourseTableRow"
import { Tables } from "@/types/database.types"

interface CoursesTabProps {
  courses: Tables<"courses">[]
  onCoursesUpdate: () => void
  canAdd?: boolean
}

export default function CourseTab({
  courses,
  onCoursesUpdate,
  canAdd = false,
}: CoursesTabProps) {
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <CourseTableRow
                  key={course.id}
                  onCourseUpdated={onCoursesUpdate}
                  course={course}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}