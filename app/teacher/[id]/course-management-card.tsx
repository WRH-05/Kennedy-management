"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { CourseInstanceWithEnrichment } from "@/services/courseInstancesService"
import { usePaginatedGradeLevels } from "@/hooks/useGradeLevels"

function teacherEarnings(course: CourseInstanceWithEnrichment): number {
  const compType = (course as any).compensation_type || "percentage"
  const studentCount = course.student_ids?.length || 0
  if (compType === "fixed_salary") {
    return (course as any).fixed_salary_amount || 0
  }
  return Math.round((course.price * studentCount * (course.percentage_cut || 0)) / 100)
}

interface CourseManagementCardProps {
  activeCourses: CourseInstanceWithEnrichment[]
  completedCourses: CourseInstanceWithEnrichment[]
}

export function CourseManagementCard({ activeCourses, completedCourses }: CourseManagementCardProps) {
  const { gradeLevels } = usePaginatedGradeLevels(1, 0)

  const gradeNamesFor = (course: CourseInstanceWithEnrichment) => {
    if (course.grade_level_ids?.length) {
      const names = course.grade_level_ids
        .map((id) => gradeLevels.find((gl) => gl.id === id)?.name)
        .filter((n): n is string => Boolean(n))
      if (names.length) return names.join(", ")
    }
    return course.course_eligibility?.grade_levels?.name ?? "—"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Course Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Active Course Instances */}
          <div>
            <h3 className="font-medium text-lg mb-4">Active Course Instances</h3>
            {activeCourses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade Levels</TableHead>
                    <TableHead>Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <Link href={`/course-instance/${course.id}`} className="hover:underline">
                          {(course.display_name || course.course_eligibility?.courses?.name) ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>{gradeNamesFor(course)}</TableCell>
                      <TableCell>{teacherEarnings(course)} DA</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-600">No active course instances</p>
            )}
          </div>

          {/* Completed Course Instances */}
          {completedCourses.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-4">Completed Course Instances</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade Levels</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedCourses.map((course) => (
                    <TableRow key={course.id} className="opacity-60">
                      <TableCell className="font-medium">
                        <Link href={`/course-instance/${course.id}`} className="hover:underline">
                          {(course.display_name || course.course_eligibility?.courses?.name) ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>{gradeNamesFor(course)}</TableCell>
                      <TableCell>{teacherEarnings(course)} DA</TableCell>
                      <TableCell>{course.student_ids.length || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
