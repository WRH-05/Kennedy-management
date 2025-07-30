"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, CreditCard, User, BookOpen } from "lucide-react"

// Mock student data
const mockStudentDetails = {
  1: {
    id: 1,
    name: "Ahmed Ben Ali",
    schoolYear: "3AS",
    specialty: "Math",
    registrationDate: "2024-01-15",
    phone: "+213 555 123 456",
    address: "123 Rue de la Paix, Alger",
    courses: [
      {
        id: 1,
        subject: "Mathematics",
        teacher: "Prof. Salim",
        timeSlot: "9:00-11:00",
        monthlyFee: 3000,
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
    registrationDate: "2024-01-10",
    phone: "+213 555 789 012",
    address: "456 Avenue Mohamed V, Oran",
    courses: [
      {
        id: 1,
        subject: "Physics",
        teacher: "Prof. Amina",
        timeSlot: "14:00-16:00",
        monthlyFee: 2800,
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
        monthlyFee: 2800,
        payments: [
          { month: "January", paid: true, date: "2024-01-10" },
          { month: "February", paid: false, date: null },
        ],
      },
    ],
  },
}

export default function StudentDashboard() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<any>(null)

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

  const totalMonthlyFees = student.courses.reduce((sum: number, course: any) => sum + course.monthlyFee, 0)
  const paidThisMonth = student.courses.reduce((sum: number, course: any) => {
    const currentMonthPayment = course.payments.find((p: any) => p.month === "January")
    return sum + (currentMonthPayment?.paid ? course.monthlyFee : 0)
  }, 0)

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
          <div className="lg:col-span-1">
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
                    <span className="font-medium">Phone:</span> {student.phone}
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
          </div>

          {/* Courses and Payments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Enrolled Courses
                </CardTitle>
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
                          <p className="text-gray-600">Monthly Fee: {course.monthlyFee.toLocaleString()} DA</p>
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
