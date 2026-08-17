"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, CalendarDays, Archive } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { CourseInstanceDetail, courseInstancesService, CourseInstanceWithEnrichment } from "@/services/courseInstancesService"
import { paymentService } from "@/services/paymentService"
import { useToast } from "@/hooks/use-toast"

import { CourseInstancesInfoCard } from "./courseInstancesInfoCard"
import { PaymentSummaryCard } from "./payment-summary-card"
import { BillingPeriodToolbar } from "./billing-period-toolbar"
import { StudentsManagementCard } from "./students-management-card"
import { useStudents } from "@/hooks/useStudents"
import { teacherPayoutService } from "@/services/teacherPayoutService"
import { studentPaymentService } from "@/services/studentPaymentService"
import { Tables } from "@/types/database.types"
import { TeacherPayoutReport } from "@/components/dashboard/TeacherPayoutReport"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"

function CourseInstancesDetailContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const CourseInstancesId = params.id as string
  const { toast } = useToast()

  const [courseInstances, setCourseInstances] = useState<CourseInstanceWithEnrichment | null>(null)
  const [simpleCourseInstances, setSimpleCourseInstances] = useState<CourseInstanceDetail | null> (null)
  const [payouts, setPayouts] = useState<Tables<"teacher_payouts">[]>([])
  const [payout, setPayout] = useState<Tables<"teacher_payouts"> | null>(null)
  const [studentPayments, setStudentPayments] = useState<Tables<"student_payments">[]>([])
  const [billingPeriods, setBillingPeriods] = useState<Tables<"billing_periods">[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("")
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const { settings } = useSchoolSettings()

  const [confirmDialog, setConfirmDialog] = useState({
    open: false, title: "", description: "", action: () => { },
  })

  const { students: allStudents } = useStudents();

  const students = useMemo(() =>
    (allStudents && 'data' in allStudents ? allStudents.data : []),
    [allStudents]
  )

  // Sync selectedPeriodId with URL query param
  const handleCycleChange = useCallback((cycleId: string) => {
    setSelectedPeriodId(cycleId)
    router.replace(`/course-instance/${CourseInstancesId}?cycle=${cycleId}`, { scroll: false })
  }, [CourseInstancesId, router])

  // Compute status dots for each billing cycle
  const cycleStatuses = useMemo(() => {
    const statuses: Record<string, 'red' | 'orange' | 'green'> = {}
    const totalEnrolled = courseInstances?.student_ids?.length || 0
    const newestCycleId = billingPeriods[0]?.id

    billingPeriods.forEach((bp) => {
      const paidCount = studentPayments.filter(
        (p) => p.billing_period_id === bp.id && p.status === 'paid'
      ).length
      const payoutRecord = payouts.find((p) => p.billing_period_id === bp.id)
      const allStudentsPaid = totalEnrolled > 0 && paidCount >= totalEnrolled
      const payoutStatus = payoutRecord?.status as string | undefined
      const teacherPaid = payoutRecord && (payoutStatus === 'approved' || payoutStatus === 'paid')

      if (allStudentsPaid && teacherPaid) {
        statuses[bp.id] = 'green'
      } else if (bp.id === newestCycleId) {
        statuses[bp.id] = 'orange'
      } else if (allStudentsPaid && (!payoutRecord || payoutRecord.status === 'pending')) {
        statuses[bp.id] = 'orange'
      } else {
        statuses[bp.id] = 'red'
      }
    })

    return statuses
  }, [billingPeriods, studentPayments, payouts, courseInstances])

  // Initialize selectedPeriodId once from URL param or default to newest cycle
  const initialCycleSet = useRef(false)

  // Reset the gate when navigating to a different course instance
  useEffect(() => {
    initialCycleSet.current = false
    setSelectedPeriodId("")
  }, [CourseInstancesId])

  useEffect(() => {
    if (billingPeriods.length > 0 && !initialCycleSet.current) {
      const cycleParam = searchParams.get('cycle')
      const validCycle = cycleParam ? billingPeriods.find(bp => bp.id === cycleParam) : null
      const targetId = validCycle ? validCycle.id : billingPeriods[0].id
      setSelectedPeriodId(targetId)
      initialCycleSet.current = true
    }
  }, [billingPeriods, searchParams])

  // 1. Core initialization data (Only runs once on mount or if ID changes)
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const [rawCourseData, billingData, teacherPayoutsData, studentPaymentsData] = await Promise.all([
        courseInstancesService.getCourseInstanceById(CourseInstancesId),
        paymentService.getBillingPeriods(CourseInstancesId),
        teacherPayoutService.getAllTeacherPayouts(CourseInstancesId),
        studentPaymentService.getPaymentsByCourseId(CourseInstancesId),
      ])
      setSimpleCourseInstances(rawCourseData);
      setPayouts(teacherPayoutsData)
      setStudentPayments(studentPaymentsData)
      setBillingPeriods(billingData || [])

      // Safe alignment with our array-based batch enrichment service
      const [enrichedCourse] = await courseInstancesService.enrichCoursesWithStudentsBatch([rawCourseData])
      setCourseInstances(enrichedCourse)

    } catch (error) {
      console.error("Failed to load initial course data:", error)
    } finally {
      setLoading(false)
    }
  }, [CourseInstancesId])

  // 2. Period-specific data loading (Runs independently when switching tabs)
  const loadPeriodData = useCallback(async () => {
    if (!selectedPeriodId) return

    try {
      // Avoid looking into stale 'payouts' state by scanning across latest data if loaded, or state if it exists
      setPayout(payouts.find((p) => p.billing_period_id === selectedPeriodId) || null)
    } catch (error) {
      console.error("Failed to load data for selected period:", error)
    }
  }, [selectedPeriodId, payouts])

  // Fire handlers sequentially based on context mutations
  useEffect(() => { loadInitialData() }, [loadInitialData])
  useEffect(() => { loadPeriodData() }, [loadPeriodData])

  const toggleTeacherPayment = () => {
    if (!selectedPeriodId) {
      toast({
        title: "Billing cycle required",
        description: "Please select or create a billing cycle before recording a teacher payout.",
        variant: "destructive",
      })
      return
    }
    if (!courseInstances?.teacher_id) return

    // Calculate earnings based on compensation type
    const compType = (courseInstances as any).compensation_type || 'percentage'
    const studentCount = courseInstances.student_ids?.length || 0
    let earnings: number
    if (compType === 'fixed_salary') {
      earnings = (courseInstances as any).fixed_salary_amount || 0
    } else {
      earnings = Math.round((courseInstances.price * studentCount * (courseInstances.percentage_cut || 0)) / 100)
    }

    setConfirmDialog({
      open: true,
      title: "Create Payout Request",
      description: `Create a payout request for the teacher? Amount: ${earnings} DA.`,
      action: async () => {
        try {
          await teacherPayoutService.recordTeacherPayout(earnings, selectedPeriodId, courseInstances.id)
          toast({ title: "Payout request created" })
          setCourseInstances(null)
          loadInitialData()
        } catch {
          toast({ title: "Error", variant: "destructive" })
        }
        setConfirmDialog({ open: false, title: "", description: "", action: () => { } })
      }
    })
  }

  if (!courseInstances || !simpleCourseInstances || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
      </div>
    )
  }

  const availableStudents = students.filter((student: Tables<"students">) => !courseInstances?.student_ids?.includes(student.id))
  const compType = (courseInstances as any).compensation_type || 'percentage'
  const studentCount = courseInstances.student_ids?.length || 0
  const teacherEarnings = compType === 'fixed_salary'
    ? ((courseInstances as any).fixed_salary_amount || 0)
    : Math.round((courseInstances.price * studentCount * (courseInstances.percentage_cut || 0)) / 100)
  const instanceGradeIds = (courseInstances?.grade_level_ids && courseInstances.grade_level_ids.length > 0)
    ? courseInstances.grade_level_ids
    : ((courseInstances?.course_eligibility as any)?.grade_levels?.id ? [(courseInstances?.course_eligibility as any).grade_levels.id] : [])

  const filteredStudents = availableStudents.filter((student: Tables<"students">) => {
    const nameMatch = student.name?.toLowerCase().includes(studentSearchQuery.toLowerCase())
    const studentGradeIds = [student.school_level, ...(student.extracurricular_grade_level_ids || [])]
    const gradeMatch = instanceGradeIds.length === 0 || instanceGradeIds.some((id) => studentGradeIds.includes(id))
    return nameMatch && gradeMatch
  })

  return (
    <div>
      {courseInstances.archived && (
        <Alert className="mx-auto my-4 max-w-4xl w-full border-amber-300 bg-amber-50">
          <Archive className="h-4 w-4" />
          <AlertDescription className="text-amber-800">This Class is archived and in Read-Only Mode.</AlertDescription>
        </Alert>
      )}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Class Details</h1>
          <Button variant="outline" size="sm" onClick={() => router.push(`/course-instance/${CourseInstancesId}/attendance`)} className="ml-auto mr-2">
            <CalendarDays className="h-4 w-4 mr-2" /> Attendance Register
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowReport(true)}>
            <Printer className="h-4 w-4 mr-2" /> Print Teacher Report
          </Button>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CourseInstancesInfoCard courseInstances={simpleCourseInstances} onRefresh={loadInitialData} readOnly={courseInstances.archived} />
            <PaymentSummaryCard payout={payout} teacherEarnings={teacherEarnings} onToggleTeacherPayment={toggleTeacherPayment} readOnly={courseInstances.archived} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <BillingPeriodToolbar courseInstanceId={courseInstances.id} billingPeriods={billingPeriods} selectedPeriodId={selectedPeriodId} setSelectedPeriodId={handleCycleChange} cycleStatuses={cycleStatuses} onRefresh={loadInitialData} readOnly={courseInstances.archived} />
            <StudentsManagementCard
              courseInstance={courseInstances} filteredStudents={filteredStudents}
              studentSearchQuery={studentSearchQuery} selectedPeriodId={selectedPeriodId}
              billingPeriods={billingPeriods} setSelectedPeriodId={handleCycleChange}
              setStudentSearchQuery={setStudentSearchQuery}
              onRefresh={loadInitialData}
              readOnly={courseInstances.archived}
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

      {courseInstances && simpleCourseInstances && (
        <TeacherPayoutReport
          open={showReport}
          onOpenChange={setShowReport}
          courseInstance={simpleCourseInstances}
          courseInstanceEnriched={courseInstances}
          selectedPeriodId={selectedPeriodId}
          billingPeriods={billingPeriods}
          teacherEarnings={teacherEarnings}
          schoolSettings={settings}
        />
      )}
    </div>
  )
}

export default function CourseInstancesDetail() {
  return (
    <CourseInstancesDetailContent />
  )
}