"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { CourseInstanceWithEnrichment } from "@/services/courseInstancesService"

interface CourseManagementCardProps {
  activeCourses: CourseInstanceWithEnrichment[]
  completedCourses: CourseInstanceWithEnrichment[]
}

export function CourseManagementCard({ activeCourses, completedCourses }: CourseManagementCardProps) {
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
          {/* Active courseInstances */}
          <div>
            <h3 className="font-medium text-lg mb-4">Active course intances</h3>
            {activeCourses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <Link href={`/course-instance/${course.id}`} className="hover:underline">
                          {course.subject}
                        </Link>
                      </TableCell>
                      <TableCell>{course.school_year}</TableCell>
                      <TableCell>{course.price} DA</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-600">No active course intances</p>
            )}
          </div>

          {/* Completed courseInstances */}
          {completedCourses.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-4">Completed courseInstances</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedCourses.map((course) => (
                    <TableRow key={course.id} className="opacity-60">
                      <TableCell className="font-medium">{course.subject}</TableCell>
                      <TableCell>{course.school_year}</TableCell>
                     
                      <TableCell>{course.price} DA</TableCell>
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