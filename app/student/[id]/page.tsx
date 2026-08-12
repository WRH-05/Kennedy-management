"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, User, BookOpen, AlertTriangle, CheckCircle } from "lucide-react"
import { Student, studentService } from "@/services/studentService"
import { studentPaymentService } from "@/services/studentPaymentService"
import { UpdateStudentDialog } from "@/components/tabs/StudentsTab/UpdateStudentDialog"
import { revalidateData } from "@/hooks/swr-config"
import { toast } from "@/hooks/use-toast"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"

function StudentDashboardContent() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<Student>()
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPayingFee, setIsPayingFee] = useState(false)
  const { settings } = useSchoolSettings()
  const registrationFee = settings?.default_registration_fee || 500

  const handlePayRegistrationFee = async () => {
    setIsPayingFee(true)
    try {
      await studentPaymentService.payRegistrationFee(studentId)
      toast({ title: "Registration Fee Paid", description: `${registrationFee} DA registration fee has been recorded.` })
      revalidateData('payments')
      await loadStudentData()
    } catch (error) {
      console.error("Error paying registration fee:", error)
      toast({ title: "Error", description: "Failed to record registration fee.", variant: "destructive" })
    } finally {
      setIsPayingFee(false)
    }
  }

  const loadStudentData = useCallback(async () => {
    setLoading(true)
    try {
      const studentData = await studentService.getStudentById(studentId)
      if (!studentData) router.push('/')
      setStudent(studentData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [studentId, router])

  useEffect(() => {
    loadStudentData()
  }, [loadStudentData])

  const downloadStudentCard = () => {
    toast({ title: "Coming Soon", description: "Student card download is coming soon." })
  }

  if (!student || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const studentCourseInstances = student.course_enrollments.flatMap((ce) => ce.course_instances)
  const activeCourses = studentCourseInstances.filter((course) => !course.archived)
  const completedCourses = studentCourseInstances.filter((course) => course.archived)

  const payments = student.student_payments

  const totalMonthlyFees = student.course_enrollments.reduce((sum, ce) => ce.status === "enrolled" ? sum + (ce.course_instances.monthly_price || 0) : sum + 0, 0)
  const now = new Date()
  const paidThisMonth = payments
    .filter((p) => {
      if (p.status !== 'paid') return false
      const dateStr = p.payment_date || p.created_at
      if (!dateStr) return false
      const d = new Date(dateStr)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const missedPayments = payments.filter((p) => p.status != 'paid').length

  return (
    <div>
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

            <div className="flex items-center space-x-2">
              <Button onClick={() => setIsEditDialogOpen(true)}>Edit Student</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <Label>Full Name</Label>
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                  </div>

                  <div className="space-y-2">
                    <Label>School Level</Label>
                    <p className="text-gray-600">{student.grade_levels?.name || '-'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>School</Label>
                    <p className="text-gray-600">{student.school || '-'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Current School Name</Label>
                    <p className="text-gray-600">{(student as any).school_name || '-'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Birth Date</Label>
                    <p className="text-gray-600">{student.birth_date || '-'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Student Phone</Label>
                    <p className="text-gray-600">{student.phone || '-'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Parent Phone</Label>
                    <p className="text-gray-600">{(student as any).parent_phone || '-'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <p className="text-gray-600">{student.email || '-'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <p className="text-gray-600">{student.address || '-'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Date</Label>
                    <p className="text-gray-600">{student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  {/* Registration Fee */}
                  {student.registration_fee_paid ? (
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Registration Fee Paid</span>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-amber-600 font-medium">Registration Fee Unpaid ({registrationFee} DA)</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
                        onClick={handlePayRegistrationFee}
                        disabled={isPayingFee}
                      >
                        {isPayingFee ? "Processing..." : `Pay Registration Fee (${registrationFee} DA)`}
                      </Button>
                    </div>
                  )}
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

          {/* courseInstances */}
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
                  {/* Active courseInstances */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Active Course Instances</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Monthly Price</TableHead>
                          <TableHead>Payment Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeCourses.map((course) => {
                          const isPaymentMissing = payments.filter((p) => {
                            return p.course_id == course.id && p.status != 'paid'
                          }).length > 0
                          return (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => router.push(`/course-instance/${course.id}`)}
                                >
                                  {course.course_eligibility.courses.name} - {course.course_eligibility.grade_levels?.name}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => router.push(`/teacher/${course.teacher_id}`)}
                                >
                                  {course.teachers.name}
                                </Button>
                              </TableCell>
                              <TableCell>{course.monthly_price} DA</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {isPaymentMissing ? "Missing payment" : "Paid"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Completed courseInstances */}
                  {completedCourses.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Completed courseInstances</h3>
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
                                {course.course_eligibility.courses.name} - {course.course_eligibility.grade_levels?.name}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => router.push(`/teacher/${course.teacher_id}`)}
                                >
                                  {course.teachers.name}
                                </Button>
                              </TableCell>
                              <TableCell>{course.monthly_price} DA</TableCell>
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

      <UpdateStudentDialog
        student={student}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onStudentUpdated={() => {
          setIsEditDialogOpen(false)
          loadStudentData()
        }}
      />
    </div>
  )
}

export default function StudentDashboard() {
  return (
    <StudentDashboardContent />
  )
}
