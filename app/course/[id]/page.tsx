"use client"

import type React from "react"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, BookOpen, Users, Calendar, DollarSign, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock data for course detail
const mockCourses = [
  {
    id: 1,
    teacherId: 1,
    teacherName: "Prof. Salim Benali",
    subject: "Mathematics",
    schoolYear: "3AS",
    schedule: "Monday 9:00-11:00",
    monthlyPrice: 500,
    enrolledStudents: [1],
    studentNames: ["Ahmed Ben Ali"],
    status: "active",
    payments: {
      students: { 1: true },
      teacherPaid: false,
    },
    teacherCut: 65,
    attendance: { 1: true }, // studentId: present
    courseType: "Group",
    duration: 2,
    price: 500,
    percentageCut: 65,
  },
  {
    id: 2,
    teacherId: 2,
    teacherName: "Prof. Amina Khelifi",
    subject: "Chemistry",
    schoolYear: "2AS",
    schedule: "Tuesday 16:00-18:00",
    monthlyPrice: 450,
    enrolledStudents: [2],
    studentNames: ["Fatima Zahra"],
    status: "active",
    payments: {
      students: { 2: false },
      teacherPaid: false,
    },
    teacherCut: 60,
    attendance: { 2: false },
    courseType: "Individual",
    duration: 2,
    price: 450,
    percentageCut: 60,
  },
]

const mockStudents = [
  {
    id: 1,
    name: "Ahmed Ben Ali",
    schoolYear: "3AS",
    specialty: "Math",
  },
  {
    id: 2,
    name: "Fatima Zahra",
    schoolYear: "BAC",
    specialty: "Sciences",
  },
]

export default function CourseDetail() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [showStudentResults, setShowStudentResults] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))

    // Get course data
    const courseData = mockCourses.find((c) => c.id.toString() === courseId)
    if (courseData) {
      setCourse(courseData)
    } else {
      router.push("/receptionist")
    }
  }, [courseId, router])

  const toggleAttendance = (studentId: number) => {
    setCourse((prev: any) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [studentId]: !prev.attendance[studentId],
      },
    }))
  }

  const toggleStudentPayment = (studentId: number) => {
    setCourse((prev: any) => ({
      ...prev,
      payments: {
        ...prev.payments,
        students: {
          ...prev.payments.students,
          [studentId]: !prev.payments.students[studentId],
        },
      },
    }))
  }

  const toggleTeacherPayment = () => {
    setCourse((prev: any) => ({
      ...prev,
      payments: {
        ...prev.payments,
        teacherPaid: !prev.payments.teacherPaid,
      },
    }))
  }

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    const student = mockStudents.find((s) => s.id.toString() === selectedStudent)
    if (!student) return

    setCourse((prev: any) => ({
      ...prev,
      enrolledStudents: [...prev.enrolledStudents, student.id],
      studentNames: [...prev.studentNames, student.name],
      payments: {
        ...prev.payments,
        students: {
          ...prev.payments.students,
          [student.id]: false,
        },
      },
      attendance: {
        ...prev.attendance,
        [student.id]: false,
      },
    }))

    setSelectedStudent("")
    setStudentSearchQuery("")
    setShowAddStudentDialog(false)
  }

  const removeStudentFromCourse = (studentId: number) => {
    setCourse((prev: any) => {
      const studentIndex = prev.enrolledStudents.findIndex((id: number) => id === studentId)
      if (studentIndex === -1) return prev

      const newEnrolledStudents = [...prev.enrolledStudents]
      newEnrolledStudents.splice(studentIndex, 1)

      const newStudentNames = [...prev.studentNames]
      newStudentNames.splice(studentIndex, 1)

      const newPayments = { ...prev.payments }
      delete newPayments.students[studentId]

      const newAttendance = { ...prev.attendance }
      delete newAttendance[studentId]

      return {
        ...prev,
        enrolledStudents: newEnrolledStudents,
        studentNames: newStudentNames,
        payments: {
          ...newPayments,
          students: { ...newPayments.students },
        },
        attendance: {
          ...newAttendance,
          [studentId]: false,
        },
      }
    })
  }

  if (!course || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const availableStudents = mockStudents.filter((student) => !course.enrolledStudents.includes(student.id))

  const teacherEarnings = Math.round((course.price * course.enrolledStudents.length * course.percentageCut) / 100)

  const filteredStudents = availableStudents.filter((student) =>
    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Course Details</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{course.subject}</h3>
                  <p className="text-gray-600">{course.schoolYear}</p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Teacher:</span>{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => router.push(`/teacher/${course.teacherId}`)}
                    >
                      {course.teacherName}
                    </Button>
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>
                    <Badge variant={course.courseType === "Group" ? "default" : "secondary"} className="ml-2">
                      {course.courseType}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Schedule:</span> {course.schedule}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {course.duration}h
                  </p>
                  <p>
                    <span className="font-medium">
                      {course.courseType === "Group" ? "Monthly Price" : "Session Price"}:
                    </span>{" "}
                    {course.price} DA
                  </p>
                  <p>
                    <span className="font-medium">Teacher Cut:</span> {course.percentageCut}%
                  </p>
                  <p>
                    <span className="font-medium">Enrolled Students:</span> {course.enrolledStudents.length}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p>
                    <span className="font-medium">Status:</span>
                    <Badge variant={course.status === "active" ? "default" : "secondary"} className="ml-2">
                      {course.status}
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Teacher Payment</Label>
                  <Button
                    variant={course.payments.teacherPaid ? "default" : "destructive"}
                    size="sm"
                    onClick={() => {
                      if (confirm(`Mark teacher payment as ${course.payments.teacherPaid ? "unpaid" : "paid"}?`)) {
                        toggleTeacherPayment()
                      }
                    }}
                  >
                    {course.payments.teacherPaid ? "Paid" : "Pay"}
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Total {course.courseType === "Group" ? "Monthly" : "Session"} Revenue:
                    </span>
                    <span className="text-lg font-bold">{course.price * course.enrolledStudents.length} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Teacher Earnings:</span>
                    <span className="text-lg font-bold text-green-600">{teacherEarnings} DA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students and Attendance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Enrolled Students & Management
                  </CardTitle>
                  <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                    <DialogTrigger asChild>
                      <Button disabled={availableStudents.length === 0}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Student to Course</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        {/* Replace the Select with search input */}
                        <div className="space-y-2">
                          <Label htmlFor="studentSearch">Student</Label>
                          <div className="relative">
                            <Input
                              id="studentSearch"
                              placeholder="Search for a student..."
                              value={studentSearchQuery}
                              onChange={(e) => {
                                setStudentSearchQuery(e.target.value)
                                setShowStudentResults(e.target.value.length > 0)
                              }}
                              onBlur={() => setTimeout(() => setShowStudentResults(false), 100)}
                              onFocus={() => setShowStudentResults(studentSearchQuery.length > 0)}
                              required
                            />
                            {showStudentResults && filteredStudents.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                                {filteredStudents.map((student) => (
                                  <div
                                    key={student.id}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      setSelectedStudent(student.id.toString())
                                      setStudentSearchQuery(student.name)
                                      setShowStudentResults(false)
                                    }}
                                  >
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {student.schoolYear} - {student.specialty}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {selectedStudent && (
                            <div className="text-sm text-green-600">
                              Selected: {mockStudents.find((s) => s.id.toString() === selectedStudent)?.name}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add Student</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.enrolledStudents.map((studentId: number, idx: number) => (
                      <TableRow key={studentId}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/student/${studentId}`)}
                          >
                            {course.studentNames[idx]}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={course.attendance[studentId] ? "p" : "a"}
                            onValueChange={(value) => {
                              toggleAttendance(studentId)
                            }}
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="p">P</SelectItem>
                              <SelectItem value="a">A</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={course.payments.students[studentId] ? "default" : "destructive"}
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(`Mark payment as ${course.payments.students[studentId] ? "unpaid" : "paid"}?`)
                              ) {
                                toggleStudentPayment(studentId)
                              }
                            }}
                          >
                            {course.payments.students[studentId] ? "Paid" : "Pay"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Remove student from course?")) {
                                removeStudentFromCourse(studentId)
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {course.enrolledStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No students enrolled in this course.</div>
                )}
              </CardContent>
            </Card>

            {/* Course History */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Course History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Course Created</p>
                      <p className="text-sm text-gray-600">Course was set up and activated</p>
                    </div>
                    <Badge variant="outline">Created</Badge>
                  </div>

                  {Object.entries(course.payments.students).some(([_, paid]) => paid) && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Student Payments Received</p>
                        <p className="text-sm text-gray-600">Some students have paid their fees</p>
                      </div>
                      <Badge variant="default">Payments</Badge>
                    </div>
                  )}

                  {course.payments.teacherPaid && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Teacher Payment Made</p>
                        <p className="text-sm text-gray-600">{teacherEarnings} DA paid to teacher</p>
                      </div>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  )}

                  {course.status === "completed" && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">Course Completed</p>
                        <p className="text-sm text-gray-600">All sessions finished</p>
                      </div>
                      <Badge variant="default">Completed</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
