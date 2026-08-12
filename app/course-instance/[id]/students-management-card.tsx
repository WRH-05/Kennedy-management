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
import { Users, Plus, MoreHorizontal, Check } from "lucide-react"
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
}

export function StudentsManagementCard({
  courseInstance, selectedPeriodId, filteredStudents, studentSearchQuery, billingPeriods, setStudentSearchQuery, onRefresh, setSelectedPeriodId
}: StudentsManagementProps) {
  const router = useRouter()
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [showStudentResults, setShowStudentResults] = useState(false)

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
      toast({ title: "Success", description: "New student added." })

      await Promise.all([mutate(), mutateEnrolled()])
      revalidateData('students')
      revalidateData('course-instances')
      onRefresh()

      setSelectedStudent("")
      setStudentSearchQuery("")
      setShowAddStudentDialog(false)
    } catch (error) {
      console.error(error)
    }
  }

  const onChangeStudentPaymentStatus = async (student_id: string, status: Enums<"payment_status">) => {
    try {
      const updates: any = { status, amount: courseInstance.price }
      if (status === 'paid') {
        updates.payment_date = new Date().toISOString()
      }
      await studentPaymentService.updateRecordStudentPayment(courseInstance.id, student_id, selectedPeriodId, updates);

      await mutate()
      onRefresh()
    } catch (error) {
      console.error(error)
    }
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-md">
            <Users className="h-5 w-5 mr-2" /> Enrolled Students
          </CardTitle>
          <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
            <DialogTrigger asChild>
              <Button disabled={billingPeriods.length === 0}>
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

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/student/${currentStudentId}`)}
                      >
                        {p.students?.name || "Unknown Student"}
                      </Button>
                    </TableCell>

                    {/* Payment Status Dropdown Column */}
                    <TableCell>
                      {getStatusBadge(p.status)}
                    </TableCell>

                    {/* Enrollment Status Dropdown Column */}
                    <TableCell>
                      <Select
                        value={currentEnrollmentStatus}
                        disabled={isFinalizedEnrollment}
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
                      <div className="flex items-center justify-between">
                        {isPaid ? (
                          <span className="text-xs text-emerald-600 font-medium">Paid</span>
                        ) : isFinalizedEnrollment ? (
                          <span className="text-xs text-rose-600 font-medium">Dropped</span>
                        ) : p.status === 'cancelled' ? (
                          <span className="text-xs text-muted-foreground">Cancelled</span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onChangeStudentPaymentStatus(currentStudentId, 'paid')}
                                className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Record Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}