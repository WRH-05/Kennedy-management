"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, CreditCard, User, BookOpen, Plus, Upload, AlertTriangle, CheckCircle } from "lucide-react"

// Mock student data with updated fields
const mockStudentDetails = {
  1: {
    id: 1,
    name: "Ahmed Ben Ali",
    schoolYear: "3AS",
    specialty: "Math",
    address: "123 Rue de la Paix, Alger",
    birthDate: "2005-03-15",
    phone: "+213 555 123 456",
    email: "ahmed.benali@email.com",
    school: "Lycée Mohamed Boudiaf",
    registrationDate: "2024-01-15",
    documents: {
      photos: { uploaded: true, filename: "20240115_Ben_Ahmed_Photos.pdf" },
      copyOfId: { uploaded: false, filename: null },
      registrationForm: { uploaded: true, filename: "20240115_Ben_Ahmed_Registration.pdf" },
    },
    courses: [
      {
        id: 1,
        subject: "Mathematics",
        teacher: "Prof. Salim",
        timeSlot: "9:00-11:00",
        schoolYear: "3AS",
        courseType: "Group",
        pricePerSession: 500,
        payments: [
          { month: "January", paid: true, date: "2024-01-15" },
          { month: "February", paid: false, date: null },
        ],
      },
    ],
  },
  2: {
    id: 2,
    name: "Fatima Zahra",
    schoolYear: "BAC",
    specialty: "Sciences",
    address: "456 Avenue Mohamed V, Oran",
    birthDate: "2004-07-22",
    phone: "+213 555 789 012",
    email: "fatima.zahra@email.com",
    school: "Lycée Ibn Khaldoun",
    registrationDate: "2024-01-10",
    documents: {
      photos: { uploaded: true, filename: "20240110_Zahra_Fatima_Photos.pdf" },
      copyOfId: { uploaded: true, filename: "20240110_Zahra_Fatima_ID.pdf" },
      registrationForm: { uploaded: false, filename: null },
    },
    courses: [
      {
        id: 1,
        subject: "Physics",
        teacher: "Prof. Amina",
        timeSlot: "14:00-16:00",
        schoolYear: "BAC",
        courseType: "Group",
        pricePerSession: 600,
        payments: [
          { month: "January", paid: false, date: null },
          { month: "February", paid: false, date: null },
        ],
      },
      {
        id: 2,
        subject: "Chemistry",
        teacher: "Prof. Omar",
        timeSlot: "16:00-18:00",
        schoolYear: "2AS",
        courseType: "Group",
        pricePerSession: 450,
        payments: [
          { month: "January", paid: true, date: "2024-01-10" },
          { month: "February", paid: false, date: null },
        ],
      },
    ],
  },
}

// Available courses from professors
const availableCourses = [
  {
    id: 1,
    subject: "Mathematics",
    teacher: "Prof. Salim",
    schoolYear: "3AS",
    timeSlot: "9:00-11:00",
    courseType: "Group",
    pricePerSession: 500,
  },
  {
    id: 2,
    subject: "Physics",
    teacher: "Prof. Amina",
    schoolYear: "BAC",
    timeSlot: "14:00-15:30",
    courseType: "Individual",
    pricePerSession: 800,
  },
  {
    id: 3,
    subject: "Chemistry",
    teacher: "Prof. Omar",
    schoolYear: "2AS",
    timeSlot: "16:00-18:00",
    courseType: "Group",
    pricePerSession: 450,
  },
]

export default function StudentDashboard() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<any>(null)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [uploadingDoc, setUploadingDoc] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    // Get student data
    const studentData = mockStudentDetails[studentId as keyof typeof mockStudentDetails]
    if (studentData) {
      setStudent(studentData)
    } else {
      router.push("/receptionist")
    }
  }, [studentId, router])

  const markPaymentPaid = (courseId: number, month: string) => {
    if (!student) return

    const updatedStudent = {
      ...student,
      courses: student.courses.map((course: any) => {
        if (course.id === courseId) {
          return {
            ...course,
            payments: course.payments.map((payment: any) =>
              payment.month === month
                ? { ...payment, paid: true, date: new Date().toISOString().split("T")[0] }
                : payment,
            ),
          }
        }
        return course
      }),
    }
    setStudent(updatedStudent)
  }

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!student || !selectedCourse) return

    const courseToAdd = availableCourses.find((c) => c.id.toString() === selectedCourse)
    if (!courseToAdd) return

    const newCourse = {
      id: student.courses.length + 1,
      subject: courseToAdd.subject,
      teacher: courseToAdd.teacher,
      timeSlot: courseToAdd.timeSlot,
      schoolYear: courseToAdd.schoolYear,
      courseType: courseToAdd.courseType,
      pricePerSession: courseToAdd.pricePerSession,
      payments: [
        { month: "January", paid: false, date: null },
        { month: "February", paid: false, date: null },
      ],
    }

    const updatedStudent = {
      ...student,
      courses: [...student.courses, newCourse],
    }

    setStudent(updatedStudent)
    setSelectedCourse("")
    setShowAddCourseDialog(false)
  }

  const handleFileUpload = (docType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed")
      return
    }

    // Validate filename format (YYYYMMDD_Last_First_DocType.pdf)
    const filenameRegex = /^\d{8}_[A-Za-z]+_[A-Za-z]+_[A-Za-z]+\.pdf$/
    if (!filenameRegex.test(file.name)) {
      alert("Filename must follow format: YYYYMMDD_Last_First_DocType.pdf")
      return
    }

    // Simulate upload
    setUploadingDoc(docType)
    setTimeout(() => {
      const updatedStudent = {
        ...student,
        documents: {
          ...student.documents,
          [docType]: {
            uploaded: true,
            filename: file.name,
          },
        },
      }
      setStudent(updatedStudent)
      setUploadingDoc("")
    }, 1000)
  }

  const downloadStudentCard = () => {
    // In a real app, this would generate and download a PDF
    alert("Student card download would be implemented here")
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const totalMonthlyFees = student.courses.reduce((sum: number, course: any) => sum + course.pricePerSession, 0)
  const paidThisMonth = student.courses.reduce((sum: number, course: any) => {
    const currentMonthPayment = course.payments.find((p: any) => p.month === "January")
    return sum + (currentMonthPayment?.paid ? course.pricePerSession : 0)
  }, 0)

  // Calculate alerts
  const missedPayments = student.courses.filter((course: any) =>
    course.payments.some((payment: any) => !payment.paid),
  ).length

  const missingDocuments = Object.entries(student.documents)
    .filter(([_, doc]: [string, any]) => !doc.uploaded)
    .map(([docType, _]) => docType)

  // Filter available courses (exclude already enrolled)
  const enrolledCourseIds = student.courses.map((c: any) => `${c.subject}-${c.teacher}-${c.schoolYear}`)
  const filteredAvailableCourses = availableCourses.filter(
    (course) => !enrolledCourseIds.includes(`${course.subject}-${course.teacher}-${course.schoolYear}`),
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
            <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-gray-600">
                    {student.schoolYear} - {student.specialty}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">School:</span> {student.school}
                  </p>
                  <p>
                    <span className="font-medium">Birth Date:</span> {student.birthDate}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {student.phone}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {student.email}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {student.address}
                  </p>
                  <p>
                    <span className="font-medium">Registration Date:</span> {student.registrationDate}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Monthly Fees:</span>
                    <span className="text-lg font-bold">{totalMonthlyFees.toLocaleString()} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Paid This Month:</span>
                    <span className="text-lg font-bold text-green-600">{paidThisMonth.toLocaleString()} DA</span>
                  </div>
                </div>
                <Button onClick={downloadStudentCard} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Student Card
                </Button>
              </CardContent>
            </Card>

            {/* Status Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Status Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {missedPayments > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{missedPayments} course(s) have missed payments</AlertDescription>
                  </Alert>
                )}
                {missingDocuments.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Missing documents: {missingDocuments.join(", ")}</AlertDescription>
                  </Alert>
                )}
                {missedPayments === 0 && missingDocuments.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>All payments up to date and documents complete</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Documents Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Documents Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Upload PDF files only. Filename format: YYYYMMDD_Last_First_DocType.pdf
                </div>

                {Object.entries(student.documents).map(([docType, doc]: [string, any]) => (
                  <div key={docType} className="space-y-2">
                    <Label className="capitalize">{docType.replace(/([A-Z])/g, " $1").trim()}</Label>
                    <div className="flex items-center space-x-2">
                      {doc.uploaded ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">{doc.filename}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload(docType, e)}
                            disabled={uploadingDoc === docType}
                            className="text-sm"
                          />
                          {uploadingDoc === docType && <span className="text-sm text-blue-600">Uploading...</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Courses and Payments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Enrolled Courses
                  </CardTitle>
                  <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
                    <DialogTrigger asChild>
                      <Button disabled={filteredAvailableCourses.length === 0}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddCourse} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="course">Available Courses</Label>
                          <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredAvailableCourses.map((course) => (
                                <SelectItem key={course.id} value={course.id.toString()}>
                                  {course.subject} - {course.teacher} ({course.schoolYear}) - {course.timeSlot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedCourse && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            {(() => {
                              const course = filteredAvailableCourses.find((c) => c.id.toString() === selectedCourse)
                              return course ? (
                                <div className="space-y-2">
                                  <p>
                                    <span className="font-medium">Subject:</span> {course.subject}
                                  </p>
                                  <p>
                                    <span className="font-medium">Teacher:</span> {course.teacher}
                                  </p>
                                  <p>
                                    <span className="font-medium">School Year:</span> {course.schoolYear}
                                  </p>
                                  <p>
                                    <span className="font-medium">Time:</span> {course.timeSlot}
                                  </p>
                                  <p>
                                    <span className="font-medium">Type:</span> {course.courseType}
                                  </p>
                                  <p>
                                    <span className="font-medium">Price per Session:</span> {course.pricePerSession} DA
                                  </p>
                                </div>
                              ) : null
                            })()}
                          </div>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowAddCourseDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add Course</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {student.courses.map((course: any) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{course.subject}</h4>
                          <p className="text-gray-600">Teacher: {course.teacher}</p>
                          <p className="text-gray-600">Time: {course.timeSlot}</p>
                          <p className="text-gray-600">School Year: {course.schoolYear}</p>
                          <p className="text-gray-600">Type: {course.courseType}</p>
                          <p className="text-gray-600">
                            Price per Session: {course.pricePerSession.toLocaleString()} DA
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Payment History</h5>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Month</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date Paid</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {course.payments.map((payment: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>{payment.month}</TableCell>
                                <TableCell>
                                  <Badge variant={payment.paid ? "default" : "destructive"}>
                                    {payment.paid ? "Paid" : "Pending"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{payment.date || "-"}</TableCell>
                                <TableCell>
                                  {!payment.paid && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => markPaymentPaid(course.id, payment.month)}
                                    >
                                      <CreditCard className="h-4 w-4 mr-2" />
                                      Mark as Paid
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
