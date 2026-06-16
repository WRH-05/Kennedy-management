// components/students-management-card.tsx
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus } from "lucide-react"
import { courseService } from "@/services/courseService"

interface StudentsManagementProps {
  course: any
  courseId: string
  students: any[]
  availableStudents: any[]
  filteredStudents: any[]
  billingPeriods: any[]
  studentSearchQuery: string
  selectedPeriodId: string
  setSelectedPeriodId: (id: string) => void
  setStudentSearchQuery: (query: string) => void
  onUpdateWeeklyAttendance: (studentId: number, week: string, present: boolean) => void
  onToggleStudentPayment: (studentId: string) => void
  onRemoveStudent: (studentId: number) => void
  onRefresh: () => void
}

export function StudentsManagementCard({
  course, courseId, students, availableStudents, selectedPeriodId, filteredStudents, studentSearchQuery, billingPeriods, setStudentSearchQuery,
  onUpdateWeeklyAttendance, onToggleStudentPayment, onRemoveStudent, onRefresh, setSelectedPeriodId
}: StudentsManagementProps) {
  const router = useRouter()
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [showStudentResults, setShowStudentResults] = useState(false)

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    try {
      const student = students.find((s: any) => s.id.toString() === selectedStudent)
      if (!student) return
      await courseService.enrollStudent(courseId, student.id, selectedPeriodId)
      onRefresh()
      setSelectedStudent("")
      setStudentSearchQuery("")
      setShowAddStudentDialog(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-md"><Users className="h-5 w-5 mr-2" /> Enrolled Students</CardTitle>
          <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
            <DialogTrigger asChild>
              <Button disabled={billingPeriods.length == 0}><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Student to Course</DialogTitle></DialogHeader>
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
                          <div key={student.id} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b"
                            onClick={() => {
                              setSelectedStudent(student.id.toString())
                              setStudentSearchQuery(student.name)
                              setShowStudentResults(false)
                            }}>
                            <div className="font-medium">{student.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {billingPeriods.length > 0 ? (
                      <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                        <SelectTrigger className="w-60 h-9"><SelectValue placeholder="Select Cycle" /></SelectTrigger>
                        <SelectContent>
                          {billingPeriods.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.start_date} → {p.end_date}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">No defined periods</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddStudentDialog(false)}>Cancel</Button>
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
              {["Week 1", "Week 2", "Week 3", "Week 4", "Payment", "Actions"].map((head) => <TableHead key={head}>{head}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {course.student_ids?.map((studentId: number, idx: number) => (
              <TableRow key={studentId}>
                <TableCell className="font-medium">
                  <Button variant="link" className="p-0 h-auto font-medium text-left" onClick={() => router.push(`/student/${studentId}`)}>
                    {course?.student_names?.[idx] || students.find(s => s.id === studentId)?.name || `Student ${studentId}`}
                  </Button>
                </TableCell>
                {["week1", "week2", "week3", "week4"].map((week) => (
                  <TableCell key={week}>
                    <Select value={course?.attendance?.[studentId]?.[week] ? "p" : "a"} onValueChange={(value) => onUpdateWeeklyAttendance(studentId, week, value === "p")}>
                      <SelectTrigger className="w-12 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p">P</SelectItem>
                        <SelectItem value="a">A</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant={course?.payments?.students?.[studentId] ? "default" : "destructive"} size="sm" onClick={() => onToggleStudentPayment(studentId.toString())}>
                    {course?.payments?.students?.[studentId] ? "Paid" : "Pay"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-transparent" onClick={() => onRemoveStudent(studentId)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}