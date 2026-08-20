"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap } from "lucide-react"
import { archiveService } from "@/services/archiveService"
import { useToast } from "@/hooks/use-toast"
import { AddTeacherDialog } from "./TeacherTab/AddTeacherDialog"
import { TeachersTable } from "./TeacherTab/TeachersTable"
import { Teacher } from "@/services/teacherService"

const ALL = "all"

interface TeachersTabProps {
  teachers: Teacher[]
  onTeachersUpdate: (teachers: any[]) => void
  canAdd?: boolean
  showCourses?: boolean
  showStats?: boolean
  pendingArchiveIds?: Set<string>
  subjectFilter: string
  onSubjectFilterChange: (value: string) => void
  subjectOptions: string[]
}

export default function TeachersTab({
  teachers = [],
  onTeachersUpdate,
  canAdd = false,
  pendingArchiveIds = new Set(),
  subjectFilter,
  onSubjectFilterChange,
  subjectOptions,
}: TeachersTabProps) {
  const { toast } = useToast()

  const handleArchiveTeacher = async (teacherId: string, teacherName: string) => {
    try {
      await archiveService.createArchiveRequest('teacher', teacherId, teacherName)
      toast({
        title: "Archive request submitted",
        description: "Waiting for manager approval.",
      })
    } catch (error) {
      console.error('Error creating archive request:', error)
      toast({
        title: "Error",
        description: "Failed to create archive request.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Teacher List
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={subjectFilter} onValueChange={onSubjectFilterChange}>
              <SelectTrigger className="w-[240px] h-9">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Courses</SelectItem>
                {subjectOptions.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canAdd && <AddTeacherDialog onTeacherAdded={onTeachersUpdate} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TeachersTable
          teachers={teachers}
          pendingArchiveIds={pendingArchiveIds}
          onArchive={handleArchiveTeacher}
          onTeacherUpdated={() => onTeachersUpdate([])}
        />
      </CardContent>
    </Card>
  )
}
