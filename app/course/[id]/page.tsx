// page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, BookOpen, Users, Calendar, DollarSign, Plus, FileText } from "lucide-react"
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
import { courseService, studentService, teacherService, paymentService, attendanceService, billingService } from "@/services/appDataService"
=======
import { ArrowLeft } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { courseService } from "@/services/courseService"
import { studentService } from "@/services/studentService"
import { paymentService } from "@/services/paymentService"
import { attendanceService } from "@/services/attendanceService"
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607
import { useAuth } from "@/contexts/AuthContext"
import AuthGuard from "@/components/auth/AuthGuard"
import { useToast } from "@/hooks/use-toast"

import { CourseInfoCard } from "./course-info-card"
import { PaymentSummaryCard } from "./payment-summary-card"
import { BillingPeriodToolbar } from "./billing-period-toolbar"
import { StudentsManagementCard } from "./students-management-card"

function CourseDetailContent() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()

  const [course, setCourse] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [billingPeriods, setBillingPeriods] = useState<any[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const [confirmDialog, setConfirmDialog] = useState({
    open: false, title: "", description: "", action: () => { },
  })

<<<<<<< HEAD
  // Export course report function
  const exportCourseReport = async () => {
    if (!course) return

    try {
      // Get current month for the report
      const currentDate = new Date()
      const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
      const formattedDate = currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Get teacher payout history for this month
      let teacherPayouts: any[] = []
      if (course.teacher_id) {
        try {
          teacherPayouts = await paymentService.getProfessorPaymentHistory(course.teacher_id)
        } catch (e) {
          console.error("Error fetching teacher payouts:", e)
        }
      }

      // Filter payouts for current month
      const currentMonthPayouts = teacherPayouts.filter((p: any) => {
        const payoutDate = new Date(p.created_at || p.payment_date)
        return payoutDate.getMonth() === currentDate.getMonth() && 
               payoutDate.getFullYear() === currentDate.getFullYear()
      })

      // Calculate totals
      const totalRevenue = (course?.price || 0) * (course?.student_ids?.length || 0)
      const teacherEarningsAmount = Math.round(totalRevenue * (course?.percentage_cut || 0) / 100)
      const schoolEarnings = totalRevenue - teacherEarningsAmount

      // Build report content
      let reportContent = `
================================================================================
                         COURSE REPORT
================================================================================
Generated: ${formattedDate}
Report Period: ${currentMonth}

================================================================================
                         COURSE DETAILS
================================================================================
Course: ${course.subject} - ${course.school_year}
Teacher: ${course.teacher_name}
Type: ${course.course_type}
Schedule: ${course.schedule}
Duration: ${course.duration || 'N/A'}h
Price: ${course.price} DA ${course.course_type === 'Group' ? '/month' : '/session'}
Teacher Cut: ${course.percentage_cut || 0}%
Status: ${course.status}

================================================================================
                         ENROLLMENT SUMMARY
================================================================================
Total Enrolled Students: ${course.student_ids?.length || 0}

`

      // Student Details Section
      reportContent += `
================================================================================
                         STUDENT DETAILS
================================================================================
`
      reportContent += `${'Name'.padEnd(30)} | ${'Week 1'.padEnd(8)} | ${'Week 2'.padEnd(8)} | ${'Week 3'.padEnd(8)} | ${'Week 4'.padEnd(8)} | ${'Payment'.padEnd(10)}
${'─'.repeat(100)}
`

      // Add each student's details
      const enrolledStudentIds = course.student_ids || []
      enrolledStudentIds.forEach((studentId: string, idx: number) => {
        const studentName = course.student_names?.[idx] || students.find(s => s.id === studentId)?.name || `Student ${studentId}`
        const attendance = course.attendance?.[studentId] || {}
        const isPaid = course.payments?.students?.[studentId] ? 'Paid' : 'Pending'
        
        const week1 = attendance.week1 ? 'P' : 'A'
        const week2 = attendance.week2 ? 'P' : 'A'
        const week3 = attendance.week3 ? 'P' : 'A'
        const week4 = attendance.week4 ? 'P' : 'A'

        reportContent += `${studentName.padEnd(30)} | ${week1.padEnd(8)} | ${week2.padEnd(8)} | ${week3.padEnd(8)} | ${week4.padEnd(8)} | ${isPaid.padEnd(10)}
`
      })

      // Attendance Summary
      let totalPresent = 0
      let totalAbsent = 0
      enrolledStudentIds.forEach((studentId: string) => {
        const attendance = course.attendance?.[studentId] || {}
        Object.values(attendance).forEach((present) => {
          if (present) totalPresent++
          else totalAbsent++
        })
      })

      reportContent += `
${'─'.repeat(100)}
ATTENDANCE SUMMARY:
  Total Present: ${totalPresent}
  Total Absent: ${totalAbsent}
  Attendance Rate: ${enrolledStudentIds.length > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) || 0 : 0}%

`

      // Payment Summary
      const paidCount = enrolledStudentIds.filter((id: string) => course.payments?.students?.[id]).length
      const pendingCount = enrolledStudentIds.length - paidCount

      reportContent += `
================================================================================
                         PAYMENT SUMMARY
================================================================================
Students Paid: ${paidCount}
Students Pending: ${pendingCount}
Collection Rate: ${enrolledStudentIds.length > 0 ? Math.round((paidCount / enrolledStudentIds.length) * 100) : 0}%

`

      // Financial Summary
      reportContent += `
================================================================================
                         FINANCIAL SUMMARY
================================================================================
Total Monthly Revenue: ${totalRevenue.toLocaleString()} DA
Teacher Earnings (${course.percentage_cut}%): ${teacherEarningsAmount.toLocaleString()} DA
School Earnings: ${schoolEarnings.toLocaleString()} DA

`

      // Teacher Payout History
      reportContent += `
================================================================================
                         TEACHER PAYOUT HISTORY (${currentMonth})
================================================================================
`
      if (currentMonthPayouts.length > 0) {
        reportContent += `${'Date'.padEnd(15)} | ${'Amount'.padEnd(15)} | ${'Status'.padEnd(12)} | ${'Approved By'.padEnd(20)}
${'─'.repeat(70)}
`
        currentMonthPayouts.forEach((payout: any) => {
          const payoutDate = new Date(payout.created_at || payout.payment_date).toLocaleDateString()
          reportContent += `${payoutDate.padEnd(15)} | ${(payout.amount?.toLocaleString() + ' DA').padEnd(15)} | ${(payout.status || 'N/A').padEnd(12)} | ${(payout.approved_by || '-').padEnd(20)}
`
        })
      } else {
        reportContent += `No payouts recorded for this month.
`
      }

      reportContent += `
================================================================================
                         END OF REPORT
================================================================================
`

      // Create and download the file
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Course_Report_${course.subject}_${course.school_year}_${currentDate.toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Report exported",
        description: "Course report has been downloaded.",
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Export failed",
        description: "Failed to export course report.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Load course and student data
    const loadData = async () => {
      setLoading(true)
      try {
        const [courseData, studentsData] = await Promise.all([
          courseService.getCourseInstanceById(courseId),
          studentService.getAllStudents(),
        ])
=======
  const loadData = useCallback(async () => {
    try {
      let [courseData, billingData,] = await Promise.all([
        courseService.getCourseInstanceById(courseId),
        paymentService.getBillingPeriods(courseId)
      ])
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607

      if (!courseData) {
        router.push(user?.profile?.role === 'receptionist' ? '/receptionist' : '/manager')
        return
      }

      courseData = await courseService.enrichCourseWithStudents(courseData)
      setBillingPeriods(billingData || [])
      if (billingData?.length > 0 && !selectedPeriodId) {
        setSelectedPeriodId(billingData[0].id)
      }

      let studentsBillingPeriods = await paymentService.getStudentData(selectedPeriodId);
      const studentsData: any[] = [];
      studentsBillingPeriods.forEach((bill) => {
        studentsData.push(bill.students)
      })
      setStudents(studentsData || [])
      setCourse(courseData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [courseId, router, user, selectedPeriodId])

  useEffect(() => { loadData() }, [loadData])

  const toggleTeacherPayment = () => {
    if (!course?.teacher_id) return
    const earnings = Math.round((course.price * (course.student_ids?.length || 0) * (course.percentage_cut || 0)) / 100)

    setConfirmDialog({
      open: true,
      title: "Create Payout Request",
      description: `Create a payout request for the teacher? Amount: ${earnings} DA.`,
      action: async () => {
        try {
          await paymentService.recordTeacherPayout(course.teacher_id, earnings, course.percentage_cut || 50, course.price * (course.student_ids?.length || 0), null)
          toast({ title: "Payout request created" })
          setCourse((prev: any) => ({ ...prev, payments: { ...prev.payments, teacherPaid: false, payoutPending: true } }))
        } catch {
          toast({ title: "Error", variant: "destructive" })
        }
<<<<<<< HEAD
        setConfirmDialog({ open: false, title: "", description: "", action: () => {} })
      },
    })
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    try {
      console.log("Adding student to course:", selectedStudent)
      const student = students.find((s: any) => s.id.toString() === selectedStudent)
      if (!student) return

      // Update the course in the database to include this student
      const updatedStudentIds = [...course.student_ids, student.id]
      await courseService.updateCourseInstance(courseId, {
        student_ids: updatedStudentIds
      })

      // Create mid-month billing record if there's an active billing period
      try {
        await billingService.handleStudentJoinedMidMonth(courseId, student.id)
      } catch (billingError) {
        // If no active period, this is expected - continue without billing record
        console.log("No active billing period or billing record creation skipped:", billingError)
      }

      setCourse((prev: any) => ({
        ...prev,
        student_ids: [...(prev.student_ids || []), student.id],
        student_names: [...(prev.student_names || []), student.name],
        payments: {
          ...prev.payments,
          students: {
            ...(prev.payments?.students || {}),
            [student.id]: false,
          },
        },
        attendance: {
          ...prev.attendance,
          [student.id]: { week1: false, week2: false, week3: false, week4: false },
        },
      }))

      setSelectedStudent("")
      setStudentSearchQuery("")
      setShowAddStudentDialog(false)
      
      toast({
        title: "Student added",
        description: `${student.name} has been added to the course.`,
      })
    } catch (error) {
      console.error("Error adding student to course:", error)
      toast({
        title: "Error",
        description: "Failed to add student to course: " + (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const removeStudentFromCourse = (studentId: number) => {
    const studentName = course?.student_names?.[course?.student_ids?.findIndex((id: number) => id === studentId)] || `Student ${studentId}`
    setConfirmDialog({
      open: true,
      title: "Remove Student",
      description: `Are you sure you want to remove ${studentName} from this course? Their billing record for this period will be marked as cancelled.`,
      action: async () => {
        try {
          // Update the course in database
          const newEnrolledStudents = course.student_ids.filter((id: number) => id !== studentId)
          await courseService.updateCourseInstance(courseId, {
            student_ids: newEnrolledStudents
          })

          // Mark billing record as left mid-month
          try {
            await billingService.handleStudentLeftMidMonth(courseId, studentId.toString())
          } catch (billingError) {
            console.log("No active billing period or billing update skipped:", billingError)
          }

          setCourse((prev: any) => {
            const studentIndex = prev?.student_ids?.findIndex((id: number) => id === studentId)
            if (studentIndex === -1) return prev

            const newStudentIds = [...(prev?.student_ids || [])]
            newStudentIds.splice(studentIndex, 1)

            const newStudentNames = [...(prev?.student_names || [])]
            newStudentNames.splice(studentIndex, 1)

            const newPayments = { ...prev.payments }
            if (newPayments?.students) {
              delete newPayments.students[studentId]
            }

            const newAttendance = { ...prev.attendance }
            delete newAttendance[studentId]

            return {
              ...prev,
              student_ids: newStudentIds,
              student_names: newStudentNames,
              payments: {
                ...newPayments,
                students: { ...(newPayments?.students || {}) },
              },
              attendance: {
                ...newAttendance,
              },
            }
          })

          toast({
            title: "Student removed",
            description: `${studentName} has been removed from the course.`,
          })
        } catch (error) {
          console.error("Error removing student:", error)
          toast({
            title: "Error",
            description: "Failed to remove student from course.",
            variant: "destructive",
          })
        }
        setConfirmDialog({ open: false, title: "", description: "", action: () => {} })
      },
=======
        setConfirmDialog({ open: false, title: "", description: "", action: () => { } })
      }
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607
    })
  }

  if (!course || !user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
      </div>
    )
  }

  const availableStudents = students.filter((student: any) => !course?.student_ids?.includes(student.id))
  const teacherEarnings = Math.round((course.price * (course.student_ids?.length || 0) * (course.percentage_cut || 0)) / 100)
  const filteredStudents = availableStudents.filter((student: any) => student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
<<<<<<< HEAD
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Course Details</h1>
            </div>
            <Button variant="outline" size="sm" onClick={exportCourseReport}>
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
=======
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Course Details</h1>
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CourseInfoCard course={course} courseId={course.id} onRefresh={loadData} />
            <PaymentSummaryCard course={course} teacherEarnings={teacherEarnings} onToggleTeacherPayment={toggleTeacherPayment} />
          </div>

<<<<<<< HEAD
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
                                      {student.school_year} - {student.specialty}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {selectedStudent && (
                            <div className="text-sm text-green-600">
                              Selected: {students.find((s: any) => s.id.toString() === selectedStudent)?.name}
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
                    {course.student_ids?.map((studentId: number, idx: number) => (
                      <TableRow key={studentId}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/student/${studentId}`)}
                          >
                            {course?.student_names?.[idx] || students.find(s => s.id === studentId)?.name || `Student ${studentId}`}
                          </Button>
                        </TableCell>
                        {["week1", "week2", "week3", "week4"].map((week) => (
                          <TableCell key={week}>
                            <Select
                              value={
                                course?.attendance?.[studentId]?.[week as keyof typeof course.attendance[typeof studentId]]
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
                            variant={course?.payments?.students?.[studentId] ? "default" : "destructive"}
                            size="sm"
                            onClick={() => toggleStudentPayment(studentId.toString())}
                          >
                            {course?.payments?.students?.[studentId] ? "Paid" : "Pay"}
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

                {(course.student_ids?.length || 0) === 0 && (
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

                  {Object.entries(course?.payments?.students || {}).some(([_, paid]) => paid) && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Student Payments Received</p>
                        <p className="text-sm text-gray-600">Some students have paid their fees</p>
                      </div>
                      <Badge variant="default">Payments</Badge>
                    </div>
                  )}

                  {course?.payments?.teacherPaid && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Teacher Payment Made</p>
                        <p className="text-sm text-gray-600">{teacherEarnings} DA paid to teacher</p>
                      </div>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  )}

                  {course?.status === "completed" && (
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
=======
          <div className="lg:col-span-2 space-y-6">
            <BillingPeriodToolbar courseId={course.id} billingPeriods={billingPeriods} selectedPeriodId={selectedPeriodId} setSelectedPeriodId={setSelectedPeriodId} onRefresh={loadData} />
            <StudentsManagementCard
              course={course} courseId={course.id} filteredStudents={filteredStudents}
              studentSearchQuery={studentSearchQuery} selectedPeriodId={selectedPeriodId} 
              billingPeriods={billingPeriods} setSelectedPeriodId={setSelectedPeriodId} 
              setStudentSearchQuery={setStudentSearchQuery}
              onRefresh={loadData}
            />
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607
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
            <AlertDialogCancel onClick={() => setConfirmDialog({ open: false, title: "", description: "", action: () => { } })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.action}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function CourseDetail() {
  return (
    <AuthGuard requiredRoles={['manager', 'receptionist']}>
      <CourseDetailContent />
    </AuthGuard>
  )
}