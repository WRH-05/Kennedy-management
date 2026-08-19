"use client"

import { useMemo, useState } from "react"
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
}

export default function TeachersTab({
  teachers = [],
  onTeachersUpdate,
  canAdd = false,
  pendingArchiveIds = new Set()
}: TeachersTabProps) {
  const { toast } = useToast()
  const [subjectFilter, setSubjectFilter] = useState<string>(ALL)

  const subjectOptions = useMemo(() => {
    const names = new Set<string>()
    for (const t of teachers) {
      for (const tce of t.teachers_course_eligibility || []) {
        const name = tce.course_eligibility?.courses?.name
        if (name) names.add(name)
      }
    }
    return Array.from(names).sort()
  }, [teachers])

  const filteredTeachers = useMemo(() => {
    if (subjectFilter === ALL) return teachers
    return teachers.filter((t) =>
      (t.teachers_course_eligibility || []).some((tce) => tce.course_eligibility?.courses?.name === subjectFilter)
    )
  }, [teachers, subjectFilter])

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
        <div className="flex gap-3 pb-3">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[240px] h-9">
              <SelectValue placeholder="All Courses / Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Courses / Subjects</SelectItem>
              {subjectOptions.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TeachersTable
          teachers={filteredTeachers}
          pendingArchiveIds={pendingArchiveIds}
          onArchive={handleArchiveTeacher}
          onTeacherUpdated={() => onTeachersUpdate([])}
        />
      </CardContent>
    </Card>
  )
}
