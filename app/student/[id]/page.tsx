"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, User, BookOpen, AlertTriangle, CheckCircle, CalendarDays } from "lucide-react"
import { Student, studentService } from "@/services/studentService"
import { studentPaymentService } from "@/services/studentPaymentService"
import { UpdateStudentDialog } from "@/components/tabs/StudentsTab/UpdateStudentDialog"
import { revalidateData } from "@/hooks/swr-config"
import { toast } from "@/hooks/use-toast"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"
import { usePaginatedGradeLevels } from "@/hooks/useGradeLevels"
import { getCourseDisplayName } from "@/lib/course-display"
import { attendanceService, AttendanceStats } from "@/services/attendanceService"

function formatBirthDate(value: string | null): string {
  if (!value) return "-"
  const [y, m, d] = value.split("-")
  return d && m && y ? `${d}/${m}/${y}` : value
}

function formatAttendanceDate(value: string): string {
  const d = new Date(`${value}T00:00:00`)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString()
}

function StudentDashboardContent() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<Student>()
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPayingFee, setIsPayingFee] = useState(false)
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const { settings } = useSchoolSettings()
  const { gradeLevels } = usePaginatedGradeLevels(1, 0)
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

  useEffect(() => {
    if (!studentId) return
    attendanceService.getStudentAttendanceStats(studentId)
      .then(setAttendanceStats)
      .catch((error) => console.error("Failed to load attendance stats:", error))
  }, [studentId])

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

  const courseNameById = new Map<string, string>()
  studentCourseInstances.forEach((course) => {
    courseNameById.set(course.id, getCourseDisplayName(course))
  })

  const payments = student.student_payments

  const totalMonthlyFees = student.course_enrollments.reduce((sum, ce) => ce.status === "enrolled" ? sum + (ce.course_instances.monthly_price || 0) : sum + 0, 0)

  const academicLevelName = student.grade_levels?.name
  const extracurricularNames = (student.extracurricular_grade_level_ids || [])
    .map((id) => gradeLevels.find((g) => g.id === id)?.name)
    .filter((name): name is string => Boolean(name))

  const paidPayments = payments.filter((p) => p.status === 'paid')
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const paidThisMonth = paidPayments
    .filter((p) => {
      const d = new Date(p.payment_date || p.created_at)
      return !isNaN(d.getTime()) && d >= startOfMonth && d <= now
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0)
  const paidAllTime = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

  const missedPayments = payments.filter((p) => p.status != 'paid').length

  const hasPhone = Boolean(student.phone || (student as any).parent_phone);
  const isCardUnlocked =
    student.registration_fee_paid &&
    Boolean(student.name && hasPhone && student.birth_date)

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
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Full Name</span>
                    <h3 className="font-semibold text-base">{student.name}</h3>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Grade Levels</span>
                    <div className="flex flex-wrap gap-1.5">
                      {academicLevelName && <Badge variant="secondary">{academicLevelName}</Badge>}
                      {extracurricularNames.map((name) => (
                        <Badge key={name} variant="outline">{name}</Badge>
                      ))}
                      {!academicLevelName && extracurricularNames.length === 0 && (
                        <span className="text-sm text-gray-700">-</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Current School Name</span>
                    <p className="text-sm text-gray-700">{(student as any).school_name || '-'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Birth Date</span>
                    <p className="text-sm text-gray-700">{formatBirthDate(student.birth_date)}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Student Phone</span>
                    <p className="text-sm text-gray-700">{student.phone || '-'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Parent Phone</span>
                    <p className="text-sm text-gray-700">{(student as any).parent_phone || '-'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Email</span>
                    <p className="text-sm text-gray-700">{student.email || '-'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Address</span>
                    <p className="text-sm text-gray-700">{student.address || '-'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Registration Date</span>
                    <p className="text-sm text-gray-700">{student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}</p>
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
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">All-Time Paid:</span>
                    <span className="text-xs text-muted-foreground">{paidAllTime.toLocaleString()} DA</span>
                  </div>
                </div>
                <Button onClick={downloadStudentCard} className="w-full" disabled={!isCardUnlocked}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Student Card
                </Button>
                {!isCardUnlocked && (
                  <p className="text-xs text-muted-foreground text-center">
                    Registration fee payment and complete student information are required to unlock student card.
                  </p>
                )}
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

            {/* Attendance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {attendanceStats ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Attendance Rate</span>
                      <span className="text-2xl font-bold">{attendanceStats.rate}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800">{attendanceStats.present} Present</Badge>
                      <Badge className="bg-rose-100 text-rose-800">{attendanceStats.absent} Absent</Badge>
                      <Badge className="bg-sky-100 text-sky-800">{attendanceStats.excused} Excused</Badge>
                    </div>
                    {attendanceStats.history.length > 0 && (
                      <div className="space-y-1 pt-2 border-t">
                        <span className="text-xs text-muted-foreground font-medium">Recent Attendance</span>
                        {attendanceStats.history.map((h, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground truncate">
                              {formatAttendanceDate(h.session_date)} · {courseNameById.get(h.course_instance_id) || "Course"}
                            </span>
                            <span className="capitalize font-medium">{h.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No attendance recorded.</p>
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
                          const coursePayments = payments.filter((p) => p.course_id === course.id)
                          const latestPayment = coursePayments.length > 0
                            ? coursePayments.reduce((a, b) => (a.created_at > b.created_at ? a : b))
                            : null
                          return (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => router.push(`/course-instance/${course.id}`)}
                                >
                                  {getCourseDisplayName(course)}
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
                              <TableCell>
                                <div className="text-sm">{course.monthly_price} DA</div>
                                {latestPayment && Number(latestPayment.amount || 0) > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Fee: {Number(latestPayment.amount || 0).toLocaleString()} DA
                                    {Number(latestPayment.amount || 0) < Number((course as any).price || 0) && " (Pro-rated)"}
                                  </div>
                                )}
                              </TableCell>
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
                                {getCourseDisplayName(course)}
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
