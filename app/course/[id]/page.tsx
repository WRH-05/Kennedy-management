"use client"

import type React from "react"
import type { studentId } from "@/components/ui/studentId" // Declare the studentId variable

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataService } from "@/services/dataService"
import type { Course } from "@/mocks/courses"

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
    attendance: { 1: { week1: true, week2: false, week3: true, week4: false } },
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
    attendance: { 2: { week1: false, week2: true, week3: false, week4: true } },
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
  const [course, setCourse] = useState<Course | null>(null)
  const [user, setUser] = useState<any>(null)
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [showStudentResults, setShowStudentResults] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    action: () => {},
  })
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>("")
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))

    // Get course data
    const courseData = DataService.getCourseById(Number.parseInt(courseId))
    if (courseData) {
      setCourse(courseData)
    } else {
      router.push("/receptionist")
    }
  }, [courseId, router])

  const updateWeeklyAttendance = (studentId: number, week: string, present: boolean) => {
    setCourse((prev: any) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [studentId]: {
          ...prev.attendance[studentId],
          [week]: present,
        },
      },
    }))
  }

  const toggleStudentPayment = (studentId: number) => {
    const currentStatus = course?.current.payments.students[studentId] || false
    setConfirmDialog({
      open: true,
      title: "Confirm Payment Status",
      description: `Mark payment as ${currentStatus ? "unpaid" : "paid"}?`,
      action: () => {
        setCourse((prev: any) => {
          if (!prev) return null
          return {
            ...prev,
            current: {
              ...prev.current,
              payments: {
                ...prev.current.payments,
                students: {
                  ...prev.current.payments.students,
                  [studentId]: !currentStatus,
                },
              },
            },
          }
        })
        setConfirmDialog({ open: false, title: "", description: "", action: () => {} })
      },
    })
  }

  const toggleTeacherPayment = () => {
    const currentStatus = course?.current.payments.teacherPaid
    setConfirmDialog({
      open: true,
      title: "Confirm Teacher Payment",
      description: `Mark teacher payment as ${currentStatus ? "unpaid" : "paid"}?`,
      action: () => {
        setCourse((prev: any) => {
          if (!prev) return null
          return {
            ...prev,
            current: {
              ...prev.current,
              payments: {
                ...prev.current.payments,
                teacherPaid: !currentStatus,
              },
            },
          }
        })
        setConfirmDialog({ open: false, title: "", description: "", action: () => {} })
      },
    })
  }

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    const student = mockStudents.find((s) => s.id.toString() === selectedStudent)
    if (!student) return

    setCourse((prev: any) => {
      if (!prev) return null
      return {
        ...prev,
        current: {
          ...prev.current,
          enrolledStudents: [...prev.current.enrolledStudents, student.id],
          studentNames: [...prev.current.studentNames, student.name],
          payments: {
            ...prev.current.payments,
            students: {
              ...prev.current.payments.students,
              [student.id]: false,
            },
          },
          attendance: {
            ...prev.current.attendance,
            [student.id]: { week1: false, week2: false, week3: false, week4: false },
          },
        },
      }
    })

    setSelectedStudent("")
    setStudentSearchQuery("")
    setShowAddStudentDialog(false)
  }

  const removeStudentFromCourse = (studentId: number) => {
    const studentName =
      course?.current.studentNames[course?.current.enrolledStudents.findIndex((id: number) => id === studentId)]
    setConfirmDialog({
      open: true,
      title: "Remove Student",
      description: `Are you sure you want to remove ${studentName} from this course?`,
      action: () => {
        setCourse((prev: any) => {
          if (!prev) return null
          const studentIndex = prev.current.enrolledStudents.findIndex((id: number) => id === studentId)
          if (studentIndex === -1) return prev

          const newEnrolledStudents = [...prev.current.enrolledStudents]
          newEnrolledStudents.splice(studentIndex, 1)

          const newStudentNames = [...prev.current.studentNames]
          newStudentNames.splice(studentIndex, 1)

          const newPayments = { ...prev.current.payments }
          delete newPayments.students[studentId]

          const newAttendance = { ...prev.current.attendance }
          delete newAttendance[studentId]

          return {
            ...prev,
            current: {
              ...prev.current,
              enrolledStudents: newEnrolledStudents,
              studentNames: newStudentNames,
              payments: {
                ...newPayments,
                students: { ...newPayments.students },
              },
              attendance: {
                ...newAttendance,
              },
            },
          }
        })
        setConfirmDialog({ open: false, title: "", description: "", action: () => {} })
      },
    })
  }

  const handleResetForNewMonth = () => {
    if (!course) return

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const updatedCourse = DataService.resetCourseForNewMonth(course.id, currentMonth)

    if (updatedCourse) {
      setCourse(updatedCourse)
      setShowResetDialog(false)
    }
  }

  const viewHistory = (month: string) => {
    setSelectedHistoryMonth(month)
    setShowHistoryDialog(true)
  }

  const selectedHistory = course?.history.find((h) => h.month === selectedHistoryMonth)

  if (!course || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const availableStudents = mockStudents.filter((student) => !course.current.enrolledStudents.includes(student.id))

  const teacherEarnings = Math.round(
    (course.current.price * course.current.enrolledStudents.length * course.current.percentageCut) / 100,
  )

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
                  <h3 className="font-semibold text-lg">{course.current.subject}</h3>
                  <p className="text-gray-600">{course.current.schoolYear}</p>
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
                    <Badge variant={course.current.courseType === "Group" ? "default" : "secondary"} className="ml-2">
                      {course.current.courseType}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Schedule:</span> {course.current.schedule}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {course.current.duration}h
                  </p>
                  <p>
                    <span className="font-medium">
                      {course.current.courseType === "Group" ? "Monthly Price" : "Session Price"}:
                    </span>{" "}
                    {course.current.price} DA
                  </p>
                  <p>
                    <span className="font-medium">Teacher Cut:</span> {course.current.percentageCut}%
                  </p>
                  <p>
                    <span className="font-medium">Enrolled Students:</span> {course.current.enrolledStudents.length}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p>
                    <span className="font-medium">Status:</span>
                    <Badge variant={course.current.status === "active" ? "default" : "secondary"} className="ml-2">
                      {course.current.status}
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
                    variant={course.current.payments.teacherPaid ? "default" : "destructive"}
                    size="sm"
                    onClick={toggleTeacherPayment}
                  >
                    {course.current.payments.teacherPaid ? "Paid" : "Pay"}
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Total {course.current.courseType === "Group" ? "Monthly" : "Session"} Revenue:
                    </span>
                    <span className="text-lg font-bold">
                      {course.current.price * course.current.enrolledStudents.length} DA
                    </span>
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
                      <TableHead>Students</TableHead>
                      <TableHead>Week 1</TableHead>
                      <TableHead>Week 2</TableHead>
                      <TableHead>Week 3</TableHead>
                      <TableHead>Week 4</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.current.enrolledStudents.map((studentId: number, idx: number) => (
                      <TableRow key={studentId}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/student/${studentId}`)}
                          >
                            {course.current.studentNames[idx]}
                          </Button>
                        </TableCell>
                        {["week1", "week2", "week3", "week4"].map((week) => (
                          <TableCell key={week}>
                            <Select
                              value={
                                course.current.attendance[studentId]?.[
                                  week as keyof (typeof course.current.attendance)[studentId]
                                ]
                                  ? "p"
                                  : "a"
                              }
                              onValueChange={(value) => updateWeeklyAttendance(studentId, week, value === "p")}
                            >
                              <SelectTrigger className="w-12 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="p">P</SelectItem>
                                <SelectItem value="a">A</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant={course.current.payments.students[studentId] ? "default" : "destructive"}
                            size="sm"
                            onClick={() => toggleStudentPayment(studentId)}
                          >
                            {course.current.payments.students[studentId] ? "Paid" : "Pay"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs bg-transparent"
                            onClick={() => removeStudentFromCourse(studentId)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {course.current.enrolledStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No students enrolled in this course.</div>
                )}
              </CardContent>
            </Card>

            {/* Course History Section */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Course History
                  </CardTitle>
                  <Button onClick={() => setShowResetDialog(true)} variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reset for New Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.history.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No history available</p>
                  ) : (
                    course.history.map((entry) => (
                      <div key={entry.month} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {new Date(entry.month + "-01").toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {entry.students.length} students •
                            {Object.values(entry.payments.students).filter(Boolean).length} paid • Teacher{" "}
                            {entry.payments.teacherPaid ? "paid" : "unpaid"}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => viewHistory(entry.month)}>
                          View Details
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History Dialog */}
            <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    Course History -{" "}
                    {selectedHistory
                      ? new Date(selectedHistory.month + "-01").toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                  </DialogTitle>
                </DialogHeader>
                {selectedHistory && (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Students</TableHead>
                          <TableHead>Week 1</TableHead>
                          <TableHead>Week 2</TableHead>
                          <TableHead>Week 3</TableHead>
                          <TableHead>Week 4</TableHead>
                          <TableHead>Payment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedHistory.students.map((studentId, idx) => (
                          <TableRow key={studentId}>
                            <TableCell className="font-medium">{selectedHistory.studentNames[idx]}</TableCell>
                            {["week1", "week2", "week3", "week4"].map((week) => (
                              <TableCell key={week}>
                                <Badge
                                  variant={selectedHistory.attendance[studentId]?.[week] ? "default" : "secondary"}
                                >
                                  {selectedHistory.attendance[studentId]?.[week] ? "P" : "A"}
                                </Badge>
                              </TableCell>
                            ))}
                            <TableCell>
                              <Badge variant={selectedHistory.payments.students[studentId] ? "default" : "destructive"}>
                                {selectedHistory.payments.students[studentId] ? "Paid" : "Unpaid"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="pt-4 border-t">
                      <p className="font-medium">
                        Teacher Payment:
                        <Badge
                          variant={selectedHistory.payments.teacherPaid ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {selectedHistory.payments.teacherPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Reset Confirmation Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Course for New Month</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will move the current month's data to history and reset attendance and payments for a new
                    month. Students will remain enrolled. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetForNewMonth}>Reset Course</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmDialog({ open: false, title: "", description: "", action: () => {} })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.action}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
