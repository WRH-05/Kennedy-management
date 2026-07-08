"use client"

import { useState, useEffect } from "react"
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

import { teacherService } from "@/services/teacherService"
import { CourseInstanceDetail, courseInstancesService, CourseInstanceWithEnrichment } from "@/services/courseInstancesService"

// Sub-components imports
import { TeacherHeader } from "./teacher-header"
import { TeacherInfoCard } from "./teacher-info-card"
import { TeacherStatsCard } from "./teacher-stats-card"
import { CourseManagementCard } from "./course-management-card"
import { Tables, TablesUpdate } from "@/types/database.types"

function TeacherProfileContent() {
  const router = useRouter()
  const params = useParams()
  const teacherId = params.id as string
  
  const [teacher, setTeacher] = useState<Tables<"teachers"> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTeacher, setEditedTeacher] = useState<TablesUpdate<"teachers">>()
  const [courseInstances, setCourses] = useState<CourseInstanceWithEnrichment[]>([])
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const teacherData = await teacherService.getTeacherById(teacherId)
        if (!teacherData) {
          router.push('/')
          return
        }
        setTeacher(teacherData)
        setEditedTeacher(JSON.parse(JSON.stringify(teacherData)))

        const teacherCourses = await courseInstancesService.getCourseInstancesByTeacherId(teacherId)
        setCourses(teacherCourses)
      } catch (err) {
        console.error("Error loading teacher data:", err)
        setError("Failed to load teacher data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [teacherId, router])

  const confirmSave = async () => {
    try {
      if(!editedTeacher) return
      await teacherService.updateTeacher(teacherId, editedTeacher)
      setTeacher(null)
      setIsEditing(false)
      setShowSaveConfirmation(false)
    } catch (err) {
      console.error("Error updating teacher:", err)
      setError("Failed to update teacher")
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (editedTeacher) {
      setEditedTeacher({ ...editedTeacher, [field]: value })
    }
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
        onCancel={() => {
          setEditedTeacher(JSON.parse(JSON.stringify(teacher)))
          setIsEditing(false)
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <TeacherInfoCard 
              teacher={teacher}
              isEditing={isEditing}
              editedTeacher={editedTeacher}
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