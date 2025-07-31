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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, User, BookOpen, Upload, AlertTriangle, CheckCircle } from "lucide-react"
import { DataService } from "@/services/dataService"
import type { Student } from "@/mocks/students"
import type { Course } from "@/mocks/courses"

// Mock data (same structure as receptionist page)
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
  },
}

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
    status: "active",
    payments: {
      students: { 1: true },
      teacherPaid: false,
    },
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
    status: "active",
    payments: {
      students: { 2: false },
      teacherPaid: false,
    },
  },
]

export default function StudentDashboard() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [uploadingDoc, setUploadingDoc] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    // Get student data
    const studentData = DataService.getStudentById(Number.parseInt(studentId))
    if (studentData) {
      setStudent(studentData)
      setCourses(DataService.getCourses())
    } else {
      router.push("/receptionist")
    }
  }, [studentId, router])

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

  const studentCourses = courses.filter((course) => course.enrolledStudents.includes(Number.parseInt(studentId)))
  const activeCourses = studentCourses.filter((course) => course.status === "active")
  const completedCourses = studentCourses.filter((course) => course.status === "completed")

  const totalMonthlyFees = activeCourses.reduce((sum, course) => sum + course.monthlyPrice, 0)
  const paidThisMonth = activeCourses.reduce((sum, course) => {
    return sum + (course.payments.students[Number.parseInt(studentId)] ? course.monthlyPrice : 0)
  }, 0)

  // Calculate alerts
  const missedPayments = activeCourses.filter((course) => !course.payments.students[Number.parseInt(studentId)]).length
  const missingDocuments = Object.entries(student.documents)
    .filter(([_, doc]: [string, any]) => !doc.uploaded)
    .map(([docType, _]) => docType)

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

          {/* Courses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Active Courses */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Active Courses</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead>Monthly Price</TableHead>
                          <TableHead>Payment Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeCourses.map((course) => (
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
                              <Button
                                variant="link"
                                className="p-0 h-auto font-medium text-left"
                                onClick={() => router.push(`/teacher/${course.teacherId}`)}
                              >
                                {course.teacherName}
                              </Button>
                            </TableCell>
                            <TableCell>{course.schedule}</TableCell>
                            <TableCell>{course.monthlyPrice} DA</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  course.payments.students[Number.parseInt(studentId)] ? "default" : "destructive"
                                }
                              >
                                {course.payments.students[Number.parseInt(studentId)] ? "Paid" : "Pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Completed Courses */}
                  {completedCourses.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Completed Courses</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Monthly Price</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedCourses.map((course) => (
                            <TableRow key={course.id} className="opacity-60">
                              <TableCell className="font-medium">
                                {course.subject} - {course.schoolYear}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => router.push(`/teacher/${course.teacherId}`)}
                                >
                                  {course.teacherName}
                                </Button>
                              </TableCell>
                              <TableCell>{course.schedule}</TableCell>
                              <TableCell>{course.monthlyPrice} DA</TableCell>
                              <TableCell>
                                <Badge variant="default">Completed</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
