// components/students-management-card.tsx
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, MoreHorizontal, Check, Printer } from "lucide-react"
import { courseInstancesService } from "@/services/courseInstancesService"
import { useStudentsData } from "@/hooks/usePayments"
import { useStudents } from "@/hooks/useStudents"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCourseEnrollementStudentsByCourseId } from "@/hooks/useCourseEnrollement"
import { studentPaymentService } from "@/services/studentPaymentService"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Enums, Tables } from "@/types/database.types"
import { EnrichedCourseEnrollements } from "@/services/courseEnrollmentService"
import { revalidateData } from "@/hooks/swr-config"
import { useAuth } from "@/context/AuthContext"
import { printStudentReceipt } from "@/components/dashboard/StudentPaymentReceipt"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"
import { getSessionDates, proRateTuition } from "@/lib/schedule"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const PAYMENT_STATUSES = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "cancelled", label: "Cancelled" },
]

// Enrollment status enums
const ENROLLMENT_STATUSES = [
  { value: "enrolled", label: "Enrolled" },
  { value: "dropped", label: "Dropped" },
]

interface StudentsManagementProps {
  courseInstance: Tables<"course_instances">
  filteredStudents: Tables<"students">[]
  billingPeriods: Tables<"billing_periods">[]
  studentSearchQuery: string
  selectedPeriodId: string
  setSelectedPeriodId: (id: string) => void
  setStudentSearchQuery: (query: string) => void
  onRefresh: () => void
  readOnly?: boolean
}

export function StudentsManagementCard({
  courseInstance, selectedPeriodId, filteredStudents, studentSearchQuery, billingPeriods, setStudentSearchQuery, onRefresh, setSelectedPeriodId, readOnly = false
}: StudentsManagementProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const { settings } = useSchoolSettings()
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [showStudentResults, setShowStudentResults] = useState(false)
  const [feeOverride, setFeeOverride] = useState("")

  // SWR Hooks
  const { payments, isLoading, mutate } = useStudentsData(selectedPeriodId);
  const { students: enrolledStudentsRaw, mutate: mutateEnrolled } = useCourseEnrollementStudentsByCourseId(courseInstance.id)
  const { students: allStudents } = useStudents();

  const students = useMemo(() =>
    (allStudents && 'data' in allStudents ? allStudents.data : []),
    [allStudents]
  )

  const enrolledStudents = useMemo(() =>
    (enrolledStudentsRaw && 'data' in enrolledStudentsRaw ? enrolledStudentsRaw.data : []),
    [enrolledStudentsRaw]
  )

  const selectedPeriod = billingPeriods.find((p) => p.id === selectedPeriodId)

  const enrolledAtByStudent = useMemo(() => {
    const map = new Map<string, string>()
    enrolledStudents.forEach((e: EnrichedCourseEnrollements) => {
      if (e.student_id) map.set(e.student_id, e.enrolled_at)
    })
    return map
  }, [enrolledStudents])

  const isEnrollmentInPeriod = (studentId: string) => {
    const enrolledAt = enrolledAtByStudent.get(studentId)
    if (!enrolledAt || !selectedPeriod) return false
    const date = enrolledAt.slice(0, 10)
    const start = selectedPeriod.start_date || ""
    const end = selectedPeriod.end_date || ""
    return date >= start && date <= end
  }

  const enrollmentPricing = useMemo(() => {
    const schedule = (courseInstance as any)?.course_schedule || []
    const selectedPeriod = billingPeriods.find((p) => p.id === selectedPeriodId)
    const d = new Date()
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const fullPrice = Number(courseInstance.price) || 0
    if (!selectedPeriod) {
      return { todayStr, fullPrice, isMidCycle: false, totalSessions: 0, remainingSessions: 0, proRatedFee: fullPrice }
    }
    const start = selectedPeriod.start_date || ""
    const end = selectedPeriod.end_date || ""
    const totalSessions = getSessionDates(schedule, start, end).length
    const remainingSessions = getSessionDates(schedule, todayStr, end).length
    const isMidCycle = todayStr > start && todayStr <= end
    const proRatedFee = proRateTuition(fullPrice, totalSessions, remainingSessions)
    return { todayStr, fullPrice, isMidCycle, totalSessions, remainingSessions, proRatedFee }
  }, [courseInstance, billingPeriods, selectedPeriodId])

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    try {
      // Enrollment cap check for individual courses
      const isIndividual = (courseInstance as any).is_individual || false
      const maxStudents = (courseInstance as any).max_students
      const currentCount = (courseInstance as any).student_ids?.length || 0
      if (isIndividual && maxStudents && currentCount >= maxStudents) {
        toast({
          title: "Enrollment Cap Reached",
          description: "Individual courses are capped at a maximum of 2 students.",
          variant: "destructive",
        })
        return
      }

      const student = students.find((s: Tables<"students">) => s.id.toString() === selectedStudent)
      if (!student) return
      await courseInstancesService.enrollStudent(courseInstance.id, student.id, selectedPeriodId)

      const finalFee = enrollmentPricing.isMidCycle
        ? (feeOverride !== "" && !isNaN(Number(feeOverride)) ? Number(feeOverride) : enrollmentPricing.proRatedFee)
        : enrollmentPricing.fullPrice
      await studentPaymentService.updateRecordStudentPayment(courseInstance.id, student.id, selectedPeriodId, { amount: finalFee })

      toast({ title: "Success", description: "New student added." })

      await Promise.all([mutate(), mutateEnrolled()])
      revalidateData('students')
      revalidateData('course-instances')
      onRefresh()

      setSelectedStudent("")
      setStudentSearchQuery("")
      setFeeOverride("")
      setShowAddStudentDialog(false)
    } catch (error) {
      console.error(error)
    }
  }

  const onChangeStudentPaymentStatus = async (student_id: string, status: Enums<"payment_status">): Promise<boolean> => {
    try {
      const updates: any = { status }
      if (status === 'paid') {
        updates.payment_date = new Date().toISOString()
      }
      await studentPaymentService.updateRecordStudentPayment(courseInstance.id, student_id, selectedPeriodId, updates);

      await mutate()
      onRefresh()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const handlePayAndPrint = async (p: any) => {
    const studentId = p.students?.id
    if (!studentId) return
    const ok = await onChangeStudentPaymentStatus(studentId, 'paid')
    if (!ok) return
    revalidateData('course-instances')
    printStudentReceipt({
      receiptId: p.id,
      studentName: p.students?.name || "Unknown Student",
      parentPhone: p.students?.parent_phone ?? null,
      amount: Number(p.amount) || courseInstance.price,
      sourceLabel: "Frais de Cours",
      className: courseInstance.display_name || "Course",
      recordedByName: profile?.full_name || "-",
      paymentDate: new Date().toISOString(),
    }, settings)
  }

  const handleReprint = (p: any) => {
    printStudentReceipt({
      receiptId: p.id,
      studentName: p.students?.name || "Unknown Student",
      parentPhone: p.students?.parent_phone ?? null,
      amount: Number(p.amount) || courseInstance.price,
      sourceLabel: "Frais de Cours",
      className: courseInstance.display_name || "Course",
      recordedByName: profile?.full_name || "-",
      paymentDate: p.payment_date || p.created_at || new Date().toISOString(),
    }, settings)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Paid</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'pending':
      case 'unpaid':
      default:
        return <Badge variant="secondary">Unpaid</Badge>
    }
  }

  const onChangeEnrollmentStatus = async (student_id: string, currentStatus: string, targetStatus: string) => {
    try {
      // Logic assumes if switching away from enrolled, we execute the unenroll payload
      // You can update this body matching your backend service route requirements (e.g. courseInstancesService.updateStatus)
      if (targetStatus === "dropped") {
        await courseInstancesService.unenrollStudent(courseInstance.id, student_id, selectedPeriodId);
      }

      await Promise.all([mutate(), mutateEnrolled()])
      revalidateData('students')
      revalidateData('course-instances')
      onRefresh()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <TooltipProvider>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-md">
            <Users className="h-5 w-5 mr-2" /> Enrolled Students
          </CardTitle>
          <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
            <DialogTrigger asChild>
              <Button disabled={billingPeriods.length === 0 || readOnly}>
                <Plus className="h-4 w-4 mr-2" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Student to Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentSearch">Student Name</Label>
                  <div className="relative">
                    <Input
                      id="studentSearch"
                      placeholder="Search for a student..."
                      value={studentSearchQuery}
                      onChange={(e) => {
                        setStudentSearchQuery(e.target.value)
                        setShowStudentResults(e.target.value.length > 0)
                      }}
                      onBlur={() => setTimeout(() => setShowStudentResults(false), 150)}
                      onFocus={() => setShowStudentResults(studentSearchQuery.length > 0)}
                      required
                    />
                    {showStudentResults && filteredStudents.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                            onMouseDown={() => {
                              setSelectedStudent(student.id.toString())
                              setStudentSearchQuery(student.name)
                              setShowStudentResults(false)
                            }}
                          >
                            <div className="font-medium text-sm text-gray-900">{student.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  {billingPeriods.length > 0 ? (
                    <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Select Cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {billingPeriods.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.start_date} → {p.end_date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-muted-foreground block">No defined periods</span>
                  )}
                </div>

                {enrollmentPricing.isMidCycle && (
                  <div className="space-y-2 rounded-md border p-3 bg-muted/40">
                    <h4 className="text-sm font-semibold">Mid-Cycle Enrollment</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Full Price</span>
                      <span className="font-medium">{enrollmentPricing.fullPrice} DA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining Sessions</span>
                      <span className="font-medium">{enrollmentPricing.remainingSessions} of {enrollmentPricing.totalSessions} sessions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Auto-Calculated Fee</span>
                      <span className="font-medium">{enrollmentPricing.proRatedFee} DA</span>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="feeOverride">Override Fee (DA)</Label>
                      <Input
                        id="feeOverride"
                        type="number"
                        placeholder={String(enrollmentPricing.proRatedFee)}
                        value={feeOverride}
                        onChange={(e) => setFeeOverride(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
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
              <TableHead className="w-45">Payment Status</TableHead>
              <TableHead className="w-45">Enrollment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : (payments || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  No students enrolled for this period.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p, idx: number) => {
                const currentStudentId = p.students?.id;

                // Determine current local status state string
                const isEnrolled = enrolledStudents.some((s: EnrichedCourseEnrollements) => s.student_id === currentStudentId);
                // If you have an explicit 'missing' status saved down in your payment/enrollment object schema, 
                // swap 'p.enrollment_status' here. Otherwise fallback checks if they are in the enrollment cache array.
                const currentEnrollmentStatus = (isEnrolled ? "enrolled" : "dropped");

                const isPaid = p.status === "paid";
                const isFinalizedEnrollment = currentEnrollmentStatus === "dropped";
                const isProRated = Number(p.amount || 0) < Number(courseInstance.price || 0) && isEnrollmentInPeriod(currentStudentId);

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col items-start gap-1">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium text-left"
                          onClick={() => router.push(`/student/${currentStudentId}`)}
                        >
                          {p.students?.name || "Unknown Student"}
                        </Button>
                        {isProRated && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-default">Pro-rated</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Base Course Fee: {Number(courseInstance.price || 0).toLocaleString()} DA • Pro-rated Fee: {Number(p.amount || 0).toLocaleString()} DA
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>

                    {/* Payment Status Column */}
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-semibold">{Number(p.amount || 0).toLocaleString()} DA</span>
                        {getStatusBadge(p.status)}
                      </div>
                    </TableCell>

                    {/* Enrollment Status Dropdown Column */}
                    <TableCell>
                      <Select
                        value={currentEnrollmentStatus}
                        disabled={isFinalizedEnrollment || readOnly}
                        onValueChange={(newStatus) => onChangeEnrollmentStatus(currentStudentId, currentEnrollmentStatus, newStatus)}
                      >
                        <SelectTrigger
                          className={`w-40 h-8 text-xs capitalize disabled:opacity-100 ${currentEnrollmentStatus === "dropped"
                            ? "disabled:bg-rose-50 disabled:text-rose-700 disabled:border-rose-200"
                            : ""
                            }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENROLLMENT_STATUSES
                            .map((status) => (
                              <SelectItem key={status.value} value={status.value} className="text-xs capitalize">
                                {status.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="group">
                      {readOnly ? (
                        <span className="text-xs text-muted-foreground">Read-only</span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isPaid ? (
                              <DropdownMenuItem
                                onClick={() => handleReprint(p)}
                                className="cursor-pointer"
                              >
                                <Printer className="mr-2 h-4 w-4" />
                                Re-print Receipt
                              </DropdownMenuItem>
                            ) : !isFinalizedEnrollment && p.status !== 'cancelled' ? (
                              <DropdownMenuItem
                                onClick={() => handlePayAndPrint(p)}
                                className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Record Payment
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled className="cursor-default">
                                {isFinalizedEnrollment ? "Dropped" : "Cancelled"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}