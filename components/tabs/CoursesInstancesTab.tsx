"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import { AddCourseDialog } from "./CourseInstancesTab/AddCourseInstanceDialog"
import { CourseInstanceTableRow } from "./CourseInstancesTab/CourseInstanceTableRow"
import { CourseInstance } from "@/services/courseInstancesService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CourseInstanceSort = "default" | "closest" | "name" | "teacher"

interface CourseIntancesTabProps {
  courseInstances: CourseInstance[]
  onCoursesUpdate: (courseInstances: CourseInstance[]) => void
  canAdd?: boolean
  sort: CourseInstanceSort
  onSortChange: (sort: CourseInstanceSort) => void
}

export default function CoursesTab({
  courseInstances,
  onCoursesUpdate,
  canAdd = false,
  sort,
  onSortChange,
}: CourseIntancesTabProps) {

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            All Class Instances
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(v) => onSortChange(v as CourseInstanceSort)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="closest">Next</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
            {canAdd && (
              <AddCourseDialog
                onCourseAdded={onCoursesUpdate}
              />
            )}
          </div>
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
                  onCourseInstanceUpdated={() => onCoursesUpdate([])}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}