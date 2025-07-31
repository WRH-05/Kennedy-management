"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, GraduationCap, BookOpen, Phone, Mail, MapPin, School } from "lucide-react"
import { DataService } from "@/services/dataService"
import type { Teacher } from "@/mocks/teachers"
import type { Course } from "@/mocks/courses"

export default function TeacherDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const teacherId = Number.parseInt(params.id as string)

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const teacherData = DataService.getTeacherById(teacherId)
    const teacherCourses = DataService.getTeacherCourses(teacherId)

    if (teacherData) {
      setTeacher(teacherData)
      setCourses(teacherCourses)
    }
    setLoading(false)
  }, [teacherId])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Teacher Not Found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{teacher.name}</h1>
                <p className="text-sm text-gray-600">{teacher.subjects.join(", ")}</p>
              </div>
            </div>
            <Badge variant="default">
              {courses.length} Active Course{courses.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teacher Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Teacher Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <School className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">School</label>
                    <p className="text-sm">{teacher.school}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm">{teacher.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm">{teacher.phone}</p>
                  </div>
                </div>
                {teacher.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{teacher.email}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">School Years</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.schoolYears.map((year) => (
                      <Badge key={year} variant="outline">
                        {year}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subjects</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Teaching Courses ({courses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => router.push(`/course/${course.id}`)}
                            >
                              {course.subject} - {course.schoolYear}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge variant={course.courseType === "Group" ? "default" : "secondary"}>
                              {course.courseType}
                            </Badge>
                          </TableCell>
                          <TableCell>{course.schedule}</TableCell>
                          <TableCell>{course.enrolledStudents?.length || 0} students</TableCell>
                          <TableCell>
                            <Badge variant={course.status === "active" ? "default" : "secondary"}>
                              {course.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No courses assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
