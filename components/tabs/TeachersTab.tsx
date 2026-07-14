"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"
import { archiveService } from "@/services/archiveService"
import { useToast } from "@/hooks/use-toast"
import { AddTeacherDialog } from "./TeacherTab/AddTeacherDialog"
import { TeachersTable } from "./TeacherTab/TeachersTable"
import { Teacher } from "@/services/teacherService"

interface TeachersTabProps {
  teachers: Teacher[]
  onTeachersUpdate: (teachers: any[]) => void
  canAdd?: boolean
  showCourses?: boolean
  showStats?: boolean
  pendingArchiveIds?: Set<string>
}

export default function TeachersTab({
  teachers = [],
  onTeachersUpdate,
  canAdd = false,
  pendingArchiveIds = new Set()
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
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Teacher List
          </CardTitle>
          {canAdd && <AddTeacherDialog onTeacherAdded={onTeachersUpdate} />}
        </div>
      </CardHeader>
      <CardContent>
        <TeachersTable
          teachers={teachers}
          pendingArchiveIds={pendingArchiveIds}
          onArchive={handleArchiveTeacher}
        />
      </CardContent>
    </Card>
  )
}