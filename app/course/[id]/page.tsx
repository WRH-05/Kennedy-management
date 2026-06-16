// page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { courseService } from "@/services/courseService"
import { studentService } from "@/services/studentService"
import { paymentService } from "@/services/paymentService"
import { attendanceService } from "@/services/attendanceService"
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
  const [billingPeriodsOfStudents, setBillingPeriodsOfStudents] = useState<any[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const [confirmDialog, setConfirmDialog] = useState({
    open: false, title: "", description: "", action: () => { },
  })

  const loadData = useCallback(async () => {
    try {
      let [courseData, billingData,] = await Promise.all([
        courseService.getCourseInstanceById(courseId),
        paymentService.getBillingPeriods(courseId)
      ])

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
      setBillingPeriodsOfStudents(studentsBillingPeriods);
      const studentsData: any[] = [];
      studentsBillingPeriods.forEach((bill)=>{
        studentsData.push(bill.students)
      })
      setStudents(studentsData || [])

      const studentPayments: Record<string, boolean> = {}
      if (courseData.student_ids?.length > 0) {
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
        for (const studentId of courseData.student_ids) {
          try {
            const history = await paymentService.getStudentPaymentHistory(studentId)
            studentPayments[studentId] = history.some((p: any) => p.course_id === courseId && p.status === 'paid' && p.month === currentMonth)
          } catch {
            studentPayments[studentId] = false
          }
        }
      }

      let teacherPaidStatus = false
      if (courseData.teacher_id) {
        try { teacherPaidStatus = await paymentService.isTeacherPaidForMonth(courseData.teacher_id) } catch { }
      }

      courseData.payments = { students: studentPayments, teacherPaid: teacherPaidStatus }
      if (!courseData.attendance) courseData.attendance = {}
      setCourse(courseData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [courseId, router, user, selectedPeriodId])

  useEffect(() => { loadData() }, [loadData])

  const updateWeeklyAttendance = async (studentId: number, week: string, present: boolean) => {
    setCourse((prev: any) => ({
      ...prev,
      attendance: { ...prev.attendance, [studentId]: { ...prev.attendance?.[studentId], [week]: present } },
    }))
    try {
      await attendanceService.updateAttendance(courseId, studentId, week, present)
    } catch {
      setCourse((prev: any) => ({
        ...prev,
        attendance: { ...prev.attendance, [studentId]: { ...prev.attendance?.[studentId], [week]: !present } },
      }))
      toast({ title: 'Attendance update failed', variant: 'destructive' })
    }
  }

  const toggleStudentPayment = async (studentId: string) => {
    try {
      const paymentHistory = await paymentService.getStudentPaymentHistory(studentId)
      const coursePayment = paymentHistory.find((p: any) => p.course_id === courseId)
      let newStatus = 'paid'

      if (coursePayment) {
        newStatus = coursePayment.status === 'paid' ? 'pending' : 'paid'
        await paymentService.updatePaymentStatus(coursePayment.id, newStatus, user?.profile?.id)
      } else {
        await paymentService.recordStudentPayment(courseId, parseInt(studentId), selectedPeriodId)
        newStatus = 'pending'
      }

      setCourse((prev: any) => ({
        ...prev,
        payments: { ...prev.payments, students: { ...prev.payments?.students, [studentId]: newStatus === 'paid' } },
      }))
      toast({ title: "Success", description: `Payment marked as ${newStatus}` })
    } catch {
      toast({ title: "Error", variant: "destructive" })
    }
  }

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
        setConfirmDialog({ open: false, title: "", description: "", action: () => { } })
      }
    })
  }

  const removeStudentFromCourse = (studentId: number) => {
    const studentName = students.find(s => s.id === studentId)?.name || `Student ${studentId}`
    setConfirmDialog({
      open: true,
      title: "Remove Student",
      description: `Are you sure you want to remove ${studentName} from this course?`,
      action: async () => {
        try {
          await courseService.unenrollStudent(courseId, studentId)
          await loadData()
        } catch (error) { console.error(error) }
        setConfirmDialog({ open: false, title: "", description: "", action: () => { } })
      },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Course Details</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CourseInfoCard course={course} courseId={courseId} onRefresh={loadData} />
            <PaymentSummaryCard course={course} teacherEarnings={teacherEarnings} onToggleTeacherPayment={toggleTeacherPayment} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <BillingPeriodToolbar courseId={courseId} billingPeriods={billingPeriods} selectedPeriodId={selectedPeriodId} setSelectedPeriodId={setSelectedPeriodId} onRefresh={loadData} />
            <StudentsManagementCard
              course={course} courseId={courseId} students={students} availableStudents={availableStudents} filteredStudents={filteredStudents}
              studentSearchQuery={studentSearchQuery} selectedPeriodId={selectedPeriodId} billingPeriods={billingPeriods} setSelectedPeriodId={setSelectedPeriodId} setStudentSearchQuery={setStudentSearchQuery} onUpdateWeeklyAttendance={updateWeeklyAttendance}
              onToggleStudentPayment={toggleStudentPayment} onRemoveStudent={removeStudentFromCourse} onRefresh={loadData}
            />
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