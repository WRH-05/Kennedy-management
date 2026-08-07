"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import { AddStudentDialog } from "./StudentsTab/AddStudentDialog"
import { StudentActionsMenu } from "./StudentsTab/StudentActionsMenu"
import { Student } from "@/services/studentService"
import { TablesUpdate } from "@/types/database.types"

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
              {students.map((student) => (
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
                  <TableCell className="capitalize">{student.grade_levels.name}</TableCell>
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
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}