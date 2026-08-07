"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import { AddCourseDialog } from "./CourseInstancesTab/AddCourseInstanceDialog"
import { CourseInstanceTableRow } from "./CourseInstancesTab/CourseInstanceTableRow"
import { CourseInstance } from "@/services/courseInstancesService"

interface CourseIntancesTabProps {
  courseInstances: CourseInstance[]
  onCoursesUpdate: (courseInstances: CourseInstance[]) => void
  canAdd?: boolean
}

export default function CoursesTab({
  courseInstances,
  onCoursesUpdate,
  canAdd = false,
}: CourseIntancesTabProps) {

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            All Course Instances
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
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseInstances.map((course) => (
                <CourseInstanceTableRow
                  key={course.id}
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