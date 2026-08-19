"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"
import { AddStudentDialog } from "./StudentsTab/AddStudentDialog"
import { StudentActionsMenu } from "./StudentsTab/StudentActionsMenu"
import { Student } from "@/services/studentService"
import { usePaginatedGradeLevels } from "@/hooks/useGradeLevels"
import { TablesUpdate } from "@/types/database.types"

const ALL = "all"

interface StudentsTabProps {
  students: Student[]
  onStudentsUpdate: (students: TablesUpdate<"students">[]) => void
  canAdd?: boolean
  showPaymentStatus?: boolean
  pendingArchiveIds?: Set<string>
}

export default function StudentsTab({
  students,
  onStudentsUpdate,
  canAdd = false,
  showPaymentStatus = true,
  pendingArchiveIds = new Set()
}: StudentsTabProps) {
  const router = useRouter()
  const { gradeLevels } = usePaginatedGradeLevels(1, 0)
  const [gradeFilter, setGradeFilter] = useState<string>(ALL)
  const [feeFilter, setFeeFilter] = useState<string>(ALL)

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (gradeFilter !== ALL) {
        const inGrade = student.school_level === gradeFilter
          || (student.extracurricular_grade_level_ids || []).includes(gradeFilter)
        if (!inGrade) return false
      }
      if (feeFilter !== ALL) {
        const wantPaid = feeFilter === "paid"
        if (student.registration_fee_paid !== wantPaid) return false
      }
      return true
    })
  }, [students, gradeFilter, feeFilter])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Student List
          </CardTitle>
          {canAdd && <AddStudentDialog onStudentAdded={onStudentsUpdate} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 pb-3">
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[220px] h-9">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Levels</SelectItem>
              {gradeLevels.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name} ({g.type === 'academic' ? 'Academic' : 'Extracurricular'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={feeFilter} onValueChange={setFeeFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-113.75 overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>School Level</TableHead>
                {showPaymentStatus && <TableHead>Fee Payment</TableHead>}
                <TableHead className="w-15"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showPaymentStatus ? 4 : 3} className="text-center text-muted-foreground py-8">
                    No students match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="group">
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/student/${student.id}`)}
                      >
                        {student.name}
                      </Button>
                    </TableCell>
                    <TableCell className="capitalize">
                      {student.grade_levels?.name ||
                        (student.extracurricular_grade_level_ids?.length ? "Extracurricular" : "—")}
                    </TableCell>
                    {showPaymentStatus && (
                      <TableCell>
                        <Badge variant={student.registration_fee_paid ? "default" : "destructive"}>
                          {student.registration_fee_paid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                    )}

                    <TableCell>
                      <StudentActionsMenu
                        studentId={student.id}
                        studentName={student.name}
                        isPendingArchive={pendingArchiveIds.has(student.id)}
                        student={student}
                        onStudentUpdated={() => onStudentsUpdate([])}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
