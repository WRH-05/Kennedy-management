"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import { Tables } from "@/types/database.types"
import { AddGradeLevelDialog } from "./GradeLevelsTab/AddGradeLevelsDialog"
import { GradeLevelTableRow } from "./GradeLevelsTab/GradeLevelTableRow"

interface GradeLevelsTabProps {
  gradeLevels: Tables<"grade_levels">[]
  onGradeLevelsUpdate: () => void
  canAdd?: boolean
}

export default function GradeLevelTab({
  gradeLevels: gradeLevels,
  onGradeLevelsUpdate: onGradeLevelsUpdate,
  canAdd = false,
}: GradeLevelsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            All Grades
          </CardTitle>
          {canAdd && (
            <AddGradeLevelDialog
              ongradeLevelAdded={onGradeLevelsUpdate}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-113.75 overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradeLevels.map((gradeLevel) => (
                <GradeLevelTableRow
                  key={gradeLevel.id}
                  onGradeLevelUpdated={onGradeLevelsUpdate}
                  gradeLevel={gradeLevel}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}