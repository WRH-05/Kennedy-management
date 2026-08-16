"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Archive } from "lucide-react"

import { Teacher, teacherService } from "@/services/teacherService"
import { courseInstancesService, CourseInstanceWithEnrichment } from "@/services/courseInstancesService"
import { teacherPayoutService } from "@/services/teacherPayoutService"
import { UpdateTeacherDialog } from "@/components/tabs/TeacherTab/UpdateTeacherDialog"

// Sub-components imports
import { TeacherHeader } from "./teacher-header"
import { TeacherInfoCard } from "./teacher-info-card"
import { TeacherStatsCard } from "./teacher-stats-card"
import { CourseManagementCard } from "./course-management-card"

function TeacherProfileContent() {
  const router = useRouter()
  const params = useParams()
  const teacherId = params.id as string

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [courseInstances, setCourseInstances] = useState<CourseInstanceWithEnrichment[]>([])
  const [totalPayouts, setTotalPayouts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const teacherData = await teacherService.getTeacherById(teacherId)

      if (!teacherData) {
        router.push('/')
        return
      }

      setTeacher(teacherData)

      const assignedCourseInstances = await courseInstancesService.getCourseInstancesByTeacherId(teacherId)
      setCourseInstances(assignedCourseInstances)

      const totalPaid = await teacherPayoutService.getTotalPaidPayouts(teacherId)
      setTotalPayouts(totalPaid)
    } catch (err) {
      console.error("Error loading teacher data:", err)
      setError("Failed to load teacher data")
    } finally {
      setLoading(false)
    }
  }, [teacherId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{error || "Teacher not found"}</h2>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    )
  }

  const canEdit = !teacher.archived
  const activeCourses = courseInstances.filter((course) => !course.archived)
  const completedCourses = courseInstances.filter((course) => course.archived)
  const numberOfActiveStudents = activeCourses.reduce((acc, course) => acc + (course.student_ids?.length || 0), 0)

  return (
    <div>
      {teacher.archived && (
        <Alert className="mx-auto my-4 max-w-4xl w-full border-amber-300 bg-amber-50">
          <Archive className="h-4 w-4" />
          <AlertDescription className="text-amber-800">This Teacher is archived and in Read-Only Mode.</AlertDescription>
        </Alert>
      )}
      <TeacherHeader
        canEdit={canEdit}
        onEdit={() => setIsEditDialogOpen(true)}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <TeacherInfoCard teacher={teacher} />

            <TeacherStatsCard
              totalCourses={courseInstances.length}
              activeCourses={activeCourses.length}
              totalStudents={numberOfActiveStudents}
              completedCourses={completedCourses.length}
              totalPayouts={totalPayouts}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <CourseManagementCard
              activeCourses={activeCourses}
              completedCourses={completedCourses}
            />
          </div>
        </div>
      </div>

      <UpdateTeacherDialog
        teacher={teacher}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onTeacherUpdated={() => {
          setIsEditDialogOpen(false)
          loadData()
        }}
      />
    </div>
  )
}

export default function TeacherProfile() {
  return (
    <TeacherProfileContent />
  )
}
