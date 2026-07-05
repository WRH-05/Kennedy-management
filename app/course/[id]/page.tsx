// page.tsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { courseService } from "@/services/courseService"
import { paymentService } from "@/services/paymentService"
import { useToast } from "@/hooks/use-toast"

import { CourseInfoCard } from "./course-info-card"
import { PaymentSummaryCard } from "./payment-summary-card"
import { BillingPeriodToolbar } from "./billing-period-toolbar"
import { StudentsManagementCard } from "./students-management-card"
import { useStudents } from "@/hooks/useStudents"
import { studentPaymentService } from "@/services/studentPaymentService"
import { teacherPayoutService } from "@/services/teacherPayoutService"

function CourseDetailContent() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const { toast } = useToast()

  const [course, setCourse] = useState<any>(null)
  const [payouts, setPayouts] = useState<any[]>([])
  const [payout, setPayout] = useState<any>(null)
  const [billingPeriods, setBillingPeriods] = useState<any[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const [confirmDialog, setConfirmDialog] = useState({
    open: false, title: "", description: "", action: () => { },
  })

  const { students: allStudents } = useStudents();

  const students = useMemo(() =>
    (allStudents && 'data' in allStudents ? allStudents.data : []),
    [allStudents]
  )


  const loadData = useCallback(async () => {
    try {
      let [courseData, billingData, teacherPayoutsData] = await Promise.all([
        courseService.getCourseInstanceById(courseId),
        paymentService.getBillingPeriods(courseId),
        teacherPayoutService.getAllTeacherPayouts(courseId)
      ])

      setPayouts(teacherPayoutsData)

      courseData = await courseService.enrichCourseWithStudents(courseData)
      setBillingPeriods(billingData || [])
      if (billingData?.length > 0 && !selectedPeriodId) {
        setSelectedPeriodId(billingData[0].id)
      }

      let studentsBillingPeriods = await studentPaymentService.getStudentData(selectedPeriodId);
      const studentsData: any[] = [];
      studentsBillingPeriods.forEach((bill) => {
        studentsData.push(bill.students)
      })

      setPayout(payouts.find((p)=> p.billing_period_id == selectedPeriodId))

      setCourse(courseData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [courseId, router, selectedPeriodId])

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
          await teacherPayoutService.recordTeacherPayout(earnings, selectedPeriodId)
          toast({ title: "Payout request created" })
          setCourse((prev: any) => ({ ...prev, payments: { ...prev.payments, teacherPaid: false, payoutPending: true } }))
          loadData()
        } catch {
          toast({ title: "Error", variant: "destructive" })
        }
        setConfirmDialog({ open: false, title: "", description: "", action: () => { } })
      }
    })
  }

  if (!course || loading) {
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
            <CourseInfoCard course={course} courseId={course.id} onRefresh={loadData} />
            <PaymentSummaryCard payout={payout} course={course} teacherEarnings={teacherEarnings} onToggleTeacherPayment={toggleTeacherPayment} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <BillingPeriodToolbar courseId={course.id} billingPeriods={billingPeriods} selectedPeriodId={selectedPeriodId} setSelectedPeriodId={setSelectedPeriodId} onRefresh={loadData} />
            <StudentsManagementCard
              course={course} filteredStudents={filteredStudents}
              studentSearchQuery={studentSearchQuery} selectedPeriodId={selectedPeriodId}
              billingPeriods={billingPeriods} setSelectedPeriodId={setSelectedPeriodId}
              setStudentSearchQuery={setStudentSearchQuery}
              onRefresh={loadData}
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
    <CourseDetailContent />
  )
}