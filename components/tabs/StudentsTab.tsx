"use client"

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
  gradeFilter: string
  onGradeFilterChange: (value: string) => void
  feeFilter: string
  onFeeFilterChange: (value: string) => void
}

export default function StudentsTab({
  students,
  onStudentsUpdate,
  canAdd = false,
  showPaymentStatus = true,
  pendingArchiveIds = new Set(),
  gradeFilter,
  onGradeFilterChange,
  feeFilter,
  onFeeFilterChange,
}: StudentsTabProps) {
  const router = useRouter()
  const { gradeLevels } = usePaginatedGradeLevels(1, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Student List
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={gradeFilter} onValueChange={onGradeFilterChange}>
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

            <Select value={feeFilter} onValueChange={onFeeFilterChange}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>

            {canAdd && <AddStudentDialog onStudentAdded={onStudentsUpdate} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showPaymentStatus ? 4 : 3} className="text-center text-muted-foreground py-8">
                    No students match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
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
