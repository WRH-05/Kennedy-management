"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

import { coursesService } from "@/services/coursesService"
import { courseInstancesService, CourseInstanceWithEnrichment } from "@/services/courseInstancesService"

// Sub-components imports
import { CourseHeader } from "./course-header"
import { CourseInfoCard } from "./course-info-card"
import { GradeLevelManagementCard } from "./grade-levels-management-card"
import { ActiveClassInstancesCard } from "@/components/ActiveClassInstancesCard"
import { Tables } from "@/types/database.types"
import { AssociatedGradeLevelsCourses } from "@/services/gradeLevelsService"
import { coursesEligiblityService } from "@/services/courseEligibilityService"
import { UpdateCourseDialog } from "@/components/tabs/CoursesTab/UpdateCourseDialog"

function TeacherProfileContent() {
    const router = useRouter()
    const params = useParams()
    const courseId = params.id as string

    const [course, setCourse] = useState<Tables<"courses"> | null>(null)
    const [gradeLevels, setGradeLevels] = useState<{
        data: AssociatedGradeLevelsCourses[]
        total: number
        page: number
        pageSize: number
    }>({
        data: [],
        total: 0,
        page: 0,
        pageSize: 0
    })
    const [activeClassInstances, setActiveClassInstances] = useState<CourseInstanceWithEnrichment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const loadData = async () => {
        try {
            const courseData = await coursesService.getCourseById(courseId)
            if (!courseData) {
                router.push('/')
                return
            }
            setCourse(courseData)

            const grades = await coursesEligiblityService.getAllGradeLevelsByCourseId(courseId)
            setGradeLevels(grades)

            const instances = await courseInstancesService.getCourseInstancesByCourseId(courseId)
            setActiveClassInstances(instances)
        } catch (err) {
            console.error("Error loading course data:", err)
            setError("Failed to load course data")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        loadData()
    }, [courseId, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
            </div>
        )
    }

    if (error || !course) {
        return (
            <div className="flex items-center justify-center py-20 text-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{error || "Course not found"}</h2>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <CourseHeader onEdit={() => setIsEditDialogOpen(true)} />

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <CourseInfoCard course={course} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <GradeLevelManagementCard gradeLevels={gradeLevels} courseId={courseId} courseType={course.type} onRefresh={loadData} />
                    <ActiveClassInstancesCard instances={activeClassInstances} />
                </div>
            </div>

            <UpdateCourseDialog
                course={course}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onCourseUpdated={() => {
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
