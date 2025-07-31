"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Users, Calendar, History, RotateCcw } from "lucide-react"
import { DataService } from "@/services/dataService"
import type { Course } from "@/mocks/courses"
import type { Student } from "@/mocks/students"

export default function CourseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = Number.parseInt(params.id as string)

  const [course, setCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const courseData = DataService.getCourseById(courseId)
    const studentsData = DataService.getStudents()

    if (courseData) {
      setCourse(courseData)
      setStudents(studentsData)
    }
    setLoading(false)
  }, [courseId])

  const handleResetForNewMonth = () => {
    if (!course) return

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    // Create history entry from current data
    const historyEntry = {
      month: currentMonth,
      students: course.current.students,
      attendance: course.current.attendance,
      payments: course.current.payments,
      completedSessions: Object.values(course.current.attendance).reduce(
        (total, sessions) => total + sessions.filter(Boolean).length,
        0,
      ),
    }

    // Update course with new history and reset current data
    const updatedCourse = {
      ...course,
      history: [...course.history, historyEntry],
      current: {
        students: course.current.students, // Keep students enrolled
        attendance: {},
        payments: {
          students: Object.keys(course.current.payments.students).reduce(
            (acc, studentId) => {
              acc[Number.parseInt(studentId)] = false
              return acc
            },
            {} as Record<number, boolean>,
          ),
          teacherPaid: false,
        },
      },
    }

    DataService.updateCourse(courseId, updatedCourse)
    setCourse(updatedCourse)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const enrolledStudents = students.filter((s) => course.enrolledStudents.includes(s.id))

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
                <h1 className="text-xl font-semibold text-gray-900">
                  {course.subject} - {course.schoolYear}
                </h1>
                <p className="text-sm text-gray-600">{course.teacherName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={course.status === "active" ? "default" : "secondary"}>{course.status}</Badge>
              <Badge variant={course.courseType === "Group" ? "default" : "outline"}>{course.courseType}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Schedule</label>
                  <p className="text-sm">{course.schedule}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-sm">{course.duration} hours</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-sm">
                    {course.price} DA {course.courseType === "Group" ? "/month" : "/session"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teacher Cut</label>
                  <p className="text-sm">{course.percentageCut}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrolled Students</label>
                  <p className="text-sm">{enrolledStudents.length} students</p>
                </div>
              </CardContent>
            </Card>

            {/* Reset Button */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Monthly Reset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Archive current month data and prepare for new month. This will clear attendance and payment records
                  while keeping enrolled students.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset for New Month
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Course for New Month</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will archive the current month's data and reset attendance and payments for a new month.
                        Students will remain enrolled. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetForNewMonth}>Reset Course</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="current" className="space-y-6">
              <TabsList>
                <TabsTrigger value="current">Current Month</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Current Month Tab */}
              <TabsContent value="current">
                <div className="space-y-6">
                  {/* Students */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Enrolled Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>School Year</TableHead>
                            <TableHead>Payment Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enrolledStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>{student.schoolYear}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={course.current.payments.students[student.id] ? "default" : "destructive"}
                                >
                                  {course.current.payments.students[student.id] ? "Paid" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Attendance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Attendance Record
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(course.current.attendance).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Sessions Attended</TableHead>
                              <TableHead>Attendance Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {enrolledStudents.map((student) => {
                              const attendance = course.current.attendance[student.id] || []
                              const attendedSessions = attendance.filter(Boolean).length
                              const totalSessions = attendance.length
                              const attendanceRate =
                                totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0

                              return (
                                <TableRow key={student.id}>
                                  <TableCell className="font-medium">{student.name}</TableCell>
                                  <TableCell>
                                    {attendedSessions}/{totalSessions}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        attendanceRate >= 80
                                          ? "default"
                                          : attendanceRate >= 60
                                            ? "secondary"
                                            : "destructive"
                                      }
                                    >
                                      {attendanceRate}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No attendance records for this month</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="h-5 w-5 mr-2" />
                      Course History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.history.length > 0 ? (
                      <div className="space-y-4">
                        {course.history
                          .sort((a, b) => b.month.localeCompare(a.month))
                          .map((historyEntry, index) => (
                            <Card key={index} className="border-l-4 border-l-blue-500">
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  {new Date(historyEntry.month + "-01").toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                  })}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {historyEntry.students.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Students</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                      {historyEntry.completedSessions}
                                    </div>
                                    <div className="text-sm text-gray-600">Sessions</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {Object.values(historyEntry.payments.students).filter(Boolean).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Paid Students</div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Student Attendance</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {historyEntry.students.map((studentId) => {
                                        const student = students.find((s) => s.id === studentId)
                                        const attendance = historyEntry.attendance[studentId] || []
                                        const attendedSessions = attendance.filter(Boolean).length
                                        const totalSessions = attendance.length
                                        const attendanceRate =
                                          totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0

                                        return (
                                          <div
                                            key={studentId}
                                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                          >
                                            <span className="text-sm font-medium">
                                              {student?.name || `Student ${studentId}`}
                                            </span>
                                            <Badge
                                              variant={
                                                attendanceRate >= 80
                                                  ? "default"
                                                  : attendanceRate >= 60
                                                    ? "secondary"
                                                    : "destructive"
                                              }
                                            >
                                              {attendanceRate}%
                                            </Badge>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Payment Status</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {historyEntry.students.map((studentId) => {
                                        const student = students.find((s) => s.id === studentId)
                                        const paid = historyEntry.payments.students[studentId]

                                        return (
                                          <div
                                            key={studentId}
                                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                          >
                                            <span className="text-sm font-medium">
                                              {student?.name || `Student ${studentId}`}
                                            </span>
                                            <Badge variant={paid ? "default" : "destructive"}>
                                              {paid ? "Paid" : "Unpaid"}
                                            </Badge>
                                          </div>
                                        )
                                      })}
                                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-sm font-medium">Teacher Payment</span>
                                        <Badge variant={historyEntry.payments.teacherPaid ? "default" : "destructive"}>
                                          {historyEntry.payments.teacherPaid ? "Paid" : "Unpaid"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No historical data available</p>
                        <p className="text-sm">History will appear after monthly resets</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
