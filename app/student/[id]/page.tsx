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
import { ArrowLeft, Download, User, BookOpen, AlertTriangle, CheckCircle } from "lucide-react"
import { studentService } from "@/services/studentService"
import { courseService } from "@/services/courseService"
import { useAuth } from "@/contexts/AuthContext"
import AuthGuard from "@/components/auth/AuthGuard"

function StudentDashboardContent() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const { user } = useAuth()
  const [student, setStudent] = useState<any>(null)
  const [editedStudent, setEditedStudent] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load student data
    const loadStudentData = async () => {
      setLoading(true)
      try {
        const studentData = await studentService.getStudentById(studentId)
        if (!studentData) {
          // Redirect based on user role
          const redirectPath = user?.profile?.role === 'receptionist' ? '/receptionist' : '/manager'
          router.push(redirectPath)
          return
        }
        setStudent(studentData)
        setEditedStudent(JSON.parse(JSON.stringify(studentData)))

        // Load courses for this student
        const studentCourses = await courseService.getCoursesByStudentId(studentId)
        setCourses(studentCourses)
      } catch (error) {
        const redirectPath = user?.profile?.role === 'receptionist' ? '/receptionist' : '/manager'
        router.push(redirectPath)
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()
  }, [studentId, router, user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setShowSaveConfirmation(true)
  }

  const confirmSave = async () => {
    try {
      if (!editedStudent) return
      setLoading(true)
      setError(null)
      const updatedStudent = await studentService.updateStudent(studentId, editedStudent)
      setStudent(updatedStudent)
      setEditedStudent(JSON.parse(JSON.stringify(updatedStudent)))
      setIsEditing(false)
      setShowSaveConfirmation(false)
    } catch (err) {
      console.error("Error updating student:", err)
      setError("Failed to update student")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedStudent(student ? JSON.parse(JSON.stringify(student)) : null)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    if (!editedStudent) return
    setEditedStudent({ ...editedStudent, [field]: value })
  }

  const downloadStudentCard = () => {
    // Student card download functionality would be implemented here
  }

  if (!student || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const studentCourses = courses.filter((course) => course.student_ids?.includes(studentId))
  const activeCourses = studentCourses.filter((course) => course.status === "active")
  const completedCourses = studentCourses.filter((course) => course.status === "completed")

  const totalMonthlyFees = activeCourses.reduce((sum, course) => sum + (course.monthly_price || 0), 0)
  const paidThisMonth = 0 // Payment tracking to be implemented with payments table

  // Calculate alerts
  const missedPayments = 0 // Payment tracking to be implemented with payments table

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
            </div>
            {user?.profile?.role && ["manager", "receptionist"].includes(user.profile.role) && (
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <Button onClick={handleEdit}>Edit Student</Button>
                ) : (
                  <>
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  </>
                )}
              </div>
            )}
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedStudent?.name ?? ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    ) : (
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school_year">School Year</Label>
                    {isEditing ? (
                      <Input
                        id="school_year"
                        value={editedStudent?.school_year ?? ""}
                        onChange={(e) => handleInputChange("school_year", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.school_year}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    {isEditing ? (
                      <Input
                        id="specialty"
                        value={editedStudent?.specialty ?? ""}
                        onChange={(e) => handleInputChange("specialty", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.specialty || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school">School</Label>
                    {isEditing ? (
                      <Input
                        id="school"
                        value={editedStudent?.school ?? ""}
                        onChange={(e) => handleInputChange("school", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.school}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Birth Date</Label>
                    {isEditing ? (
                      <Input
                        id="birth_date"
                        value={editedStudent?.birth_date ?? ""}
                        onChange={(e) => handleInputChange("birth_date", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.birth_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedStudent?.phone ?? ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedStudent?.email ?? ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={editedStudent?.address ?? ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Date</Label>
                    <p className="text-gray-600">{student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
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
            <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to save the changes to this student's profile?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmSave}>Save Changes</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Status Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Status Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {missedPayments > 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{missedPayments} course(s) have missed payments</AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>All payments up to date</AlertDescription>
                  </Alert>
                )}
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
                                onClick={() => router.push(`/teacher/${course.teacher_id}`)}
                              >
                                {course.teacher_name}
                              </Button>
                            </TableCell>
                            <TableCell>{course.schedule}</TableCell>
                            <TableCell>{course.monthly_price} DA</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                N/A
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
                                  onClick={() => router.push(`/teacher/${course.teacher_id}`)}
                                >
                                  {course.teacher_name}
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

export default function StudentDashboard() {
  return (
    <AuthGuard requiredRoles={['manager', 'receptionist']}>
      <StudentDashboardContent />
    </AuthGuard>
  )
}
