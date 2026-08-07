"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Teacher, teacherService } from "@/services/teacherService"
import { courseInstancesService, CourseInstanceWithEnrichment } from "@/services/courseInstancesService"

// Sub-components imports
import { TeacherHeader } from "./teacher-header"
import { TeacherInfoCard } from "./teacher-info-card"
import { TeacherStatsCard } from "./teacher-stats-card"
import { CourseManagementCard } from "./course-management-card"
import { TablesUpdate } from "@/types/database.types"

// Extended type tracking course eligibility ids instead of the confusing 'grade_level_ids'
export type EditedTeacherState = TablesUpdate<"teachers"> & {
  course_eligibility_ids: string[]
}

function TeacherProfileContent() {
  const router = useRouter()
  const params = useParams()
  const teacherId = params.id as string

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTeacher, setEditedTeacher] = useState<EditedTeacherState>({ course_eligibility_ids: [] })
  const [courseInstances, setCourseInstances] = useState<CourseInstanceWithEnrichment[]>([])

  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper to safely format raw teacher data into the flat state our form needs
  const formatTeacherForEditing = useCallback((teacherData: Teacher): EditedTeacherState => {
    const { teachers_course_eligibility, ...profileFields } = teacherData

    return {
      ...profileFields,
      course_eligibility_ids: teachers_course_eligibility?.flatMap(
        (tce) => [tce.course_eligibility.id]
      ) ?? []
    }
  }, [])

  // Load teacher profile data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const teacherData = await teacherService.getTeacherById(teacherId)

      if (!teacherData) {
        router.push('/')
        return
      }

      setTeacher(teacherData)
      setEditedTeacher(formatTeacherForEditing(teacherData))

      const assignedCourseInstances = await courseInstancesService.getCourseInstancesByTeacherId(teacherId)
      setCourseInstances(assignedCourseInstances)
    } catch (err) {
      console.error("Error loading teacher data:", err)
      setError("Failed to load teacher data")
    } finally {
      setLoading(false)
    }
  }, [teacherId, router, formatTeacherForEditing])

  useEffect(() => {
    loadData()
  }, [loadData])

  const confirmSave = async () => {
    try {
      if (!editedTeacher) return

      const payload = {
        ...editedTeacher,
        grade_level_ids: editedTeacher.course_eligibility_ids
      }
      
      await teacherService.updateTeacher(teacherId, payload)

      setIsEditing(false)
      setShowSaveConfirmation(false)

      await loadData()
    } catch (err) {
      console.error("Error updating teacher:", err)
      setError("Failed to update teacher")
    }
  }

  const handleInputChange = (field: string, value: any) => {
    // If the child card passes up "grade_level_ids", redirect it to our clean "course_eligibility_ids" key
    const targetField = field === "grade_level_ids" ? "course_eligibility_ids" : field
    setEditedTeacher((prev) => ({
      ...prev,
      [targetField]: value
    }))
  }

  const handleCancelEditing = () => {
    if (teacher) {
      // Revert edited state back to the original database record
      setEditedTeacher(formatTeacherForEditing(teacher))
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{error || "Teacher not found"}</h2>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    )
  }

  const canEdit = true
  const activeCourses = courseInstances.filter((course) => !course.archived)
  const completedCourses = courseInstances.filter((course) => course.archived)
  const numberOfActiveStudents = activeCourses.reduce((acc, course) => acc + (course.student_ids?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherHeader
        canEdit={canEdit}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={() => setShowSaveConfirmation(true)}
        onCancel={handleCancelEditing}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <TeacherInfoCard
              teacher={teacher}
              isEditing={isEditing}
              editedTeacher={{
                ...editedTeacher,
                // Pass it down matching the shape the card expects
                grade_level_ids: editedTeacher.course_eligibility_ids
              }}
              onInputChange={handleInputChange}
            />

            <TeacherStatsCard
              totalCourses={courseInstances.length}
              activeCourses={activeCourses.length}
              totalStudents={numberOfActiveStudents}
              completedCourses={completedCourses.length}
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

      <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save the changes to this teacher's profile?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function TeacherProfile() {
  return (
    <TeacherProfileContent />
  )
}