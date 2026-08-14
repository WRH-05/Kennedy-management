"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CourseHeader } from "./grade-level-header"
import { GradeLevelInfoCard } from "./grade-level-info-card"
import { CourseManagementCard } from "./courses-management-card"
import { ActiveClassInstancesCard } from "@/components/ActiveClassInstancesCard"
import { Tables } from "@/types/database.types"
import { AssociatedGradeLevelsCourses, gradeLevelsService } from "@/services/gradeLevelsService"
import { coursesEligiblityService } from "@/services/courseEligibilityService"
import { courseInstancesService, CourseInstanceWithEnrichment } from "@/services/courseInstancesService"
import { UpdateGradeLevelDialog } from "@/components/tabs/GradeLevelsTab/UpdateGradeLevelsDialog"

function GradeLevelProfileContent() {
    const router = useRouter()
    const params = useParams()
    const gradeLevelId = params.id as string

    const [gradeLevel, setGradeLevel] = useState<Tables<"grade_levels"> | null>(null)
    const [courses, setCourses] = useState<{
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
            const gradeLevelData = await gradeLevelsService.getGradeLevelById(gradeLevelId)
            if (!gradeLevelData) {
                router.push('/')
                return
            }
            setGradeLevel(gradeLevelData)

            const courses = await coursesEligiblityService.getAllCoursesByGradeLevelId(gradeLevelId)
            setCourses(courses)

            const instances = await courseInstancesService.getCourseInstancesByGradeLevelId(gradeLevelId)
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
    }, [gradeLevelId, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
            </div>
        )
    }

    if (error || !gradeLevel) {
        return (
            <div className="flex items-center justify-center py-20 text-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{error || "Grade Level not found"}</h2>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <CourseHeader onEdit={() => setIsEditDialogOpen(true)} />

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <GradeLevelInfoCard gradeLevel={gradeLevel} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <CourseManagementCard courses={courses} gradeLevelId={gradeLevelId} onRefresh={loadData} />
                    <ActiveClassInstancesCard instances={activeClassInstances} />
                </div>
            </div>

            <UpdateGradeLevelDialog
                GradeLevel={gradeLevel}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onGradeLevelUpdated={() => {
                    setIsEditDialogOpen(false)
                    loadData()
                }}
            />
        </div>
    )
}

export default function TeacherProfile() {
    return (
        <GradeLevelProfileContent />
    )
}
