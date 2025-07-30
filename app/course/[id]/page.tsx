"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, BookOpen, Users, Calendar, DollarSign } from "lucide-react"

// Mock data for course detail
const mockCourseInstances = [
  {
    id: 1,
    templateId: 1,
    month: "2024-01",
    studentIds: [1],
    studentNames: ["Ahmed Ben Ali"],
    status: "active",
    payments: { studentPaid: true, profPaid: false },
    attendance: { 1: true }, // studentId: present
  },
  {
    id: 2,
    templateId: 3,
    month: "2024-01",
    studentIds: [2],
    studentNames: ["Fatima Zahra"],
    status: "active",
    payments: { studentPaid: false, profPaid: false },
    attendance: { 2: false },
  },
]

const mockCourseTemplates = [
  {
    id: 1,
    professorId: 1,
    professorName: "Prof. Salim Benali",
    subject: "Mathematics",
    type: "Group",
    percentageCut: 65,
    price: 500,
    durationHours: 2,
    schedule: "Monday 9:00-11:00",
    schoolYear: "3AS",
  },
  {
    id: 3,
    professorId: 2,
    professorName: "Prof. Amina Khelifi",
    subject: "Chemistry",
    type: "Group",
    percentageCut: 60,
    price: 450,
    durationHours: 2,
    schedule: "Tuesday 16:00-18:00",
    schoolYear: "2AS",
  },
]

export default function CourseDetail() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [courseInstance, setCourseInstance] = useState<any>(null)
  const [courseTemplate, setCourseTemplate] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))

    // Get course instance data
    const instance = mockCourseInstances.find((c) => c.id.toString() === courseId)
    if (instance) {
      setCourseInstance(instance)
      const template = mockCourseTemplates.find((t) => t.id === instance.templateId)
      setCourseTemplate(template)
    } else {
      router.push("/receptionist")
    }
  }, [courseId, router])

  const toggleAttendance = (studentId: number) => {
    setCourseInstance((prev: any) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [studentId]: !prev.attendance[studentId],
      },
    }))
  }

  const togglePayment = (paymentType: "studentPaid" | "profPaid") => {
    setCourseInstance((prev: any) => {
      const newPayments = {
        ...prev.payments,
        [paymentType]: !prev.payments[paymentType],
      }
      const newStatus = newPayments.studentPaid && newPayments.profPaid ? "completed" : "active"
      return {
        ...prev,
        payments: newPayments,
        status: newStatus,
      }
    })
  }

  if (!courseInstance || !courseTemplate || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

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
                  <h3 className="font-semibold text-lg">{courseTemplate.subject}</h3>
                  <p className="text-gray-600">{courseTemplate.schoolYear}</p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Professor:</span> {courseTemplate.professorName}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>
                    <Badge variant={courseTemplate.type === "Group" ? "default" : "secondary"} className="ml-2">
                      {courseTemplate.type}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Schedule:</span> {courseTemplate.schedule}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {courseTemplate.durationHours}h
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> {courseTemplate.price} DA
                  </p>
                  <p>
                    <span className="font-medium">Professor Cut:</span> {courseTemplate.percentageCut}%
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p>
                    <span className="font-medium">Period:</span> {courseInstance.month || courseInstance.sessionDate}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <Badge variant={courseInstance.status === "active" ? "default" : "secondary"} className="ml-2">
                      {courseInstance.status}
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
                  <Label htmlFor="studentPaid">Student Payment</Label>
                  <Switch
                    id="studentPaid"
                    checked={courseInstance.payments.studentPaid}
                    onCheckedChange={() => togglePayment("studentPaid")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="profPaid">Professor Payment</Label>
                  <Switch
                    id="profPaid"
                    checked={courseInstance.payments.profPaid}
                    onCheckedChange={() => togglePayment("profPaid")}
                  />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold">{courseTemplate.price} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Professor Share:</span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round((courseTemplate.price * courseTemplate.percentageCut) / 100)} DA
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students and Attendance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Enrolled Students & Attendance
                </CardTitle>
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
                    {courseInstance.studentIds.map((studentId: number, idx: number) => (
                      <TableRow key={studentId}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/student/${studentId}`)}
                          >
                            {courseInstance.studentNames[idx]}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={courseInstance.attendance[studentId] || false}
                            onCheckedChange={() => toggleAttendance(studentId)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={courseInstance.payments.studentPaid ? "default" : "destructive"}>
                            {courseInstance.payments.studentPaid ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/student/${studentId}`)}>
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {courseInstance.studentIds.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No students enrolled in this course instance.</div>
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
                      <p className="font-medium">Course Instance Created</p>
                      <p className="text-sm text-gray-600">{courseInstance.month || courseInstance.sessionDate}</p>
                    </div>
                    <Badge variant="outline">Created</Badge>
                  </div>

                  {courseInstance.payments.studentPaid && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Student Payment Received</p>
                        <p className="text-sm text-gray-600">Payment confirmed</p>
                      </div>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  )}

                  {courseInstance.payments.profPaid && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Professor Payment Made</p>
                        <p className="text-sm text-gray-600">
                          {Math.round((courseTemplate.price * courseTemplate.percentageCut) / 100)} DA paid
                        </p>
                      </div>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  )}

                  {courseInstance.status === "completed" && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">Course Completed</p>
                        <p className="text-sm text-gray-600">All payments processed</p>
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
