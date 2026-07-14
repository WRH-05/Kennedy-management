"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CourseHeader } from "./grade-level-header"
import { GradeLevelInfoCard } from "./grade-level-info-card"
import { CourseManagementCard } from "./courses-management-card"
import { Tables } from "@/types/database.types"
import { AssociatedGradeLevelsCourses, gradeLevelsService } from "@/services/gradeLevelsService"
import { coursesEligiblityService } from "@/services/courseEligibilityService"

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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
            </div>
        )
    }

    if (error || !gradeLevel) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{error || "Grade Level not found"}</h2>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <CourseHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <GradeLevelInfoCard gradeLevel={gradeLevel} />
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <CourseManagementCard courses={courses} gradeLevelId={gradeLevelId} onRefresh={loadData} />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default function TeacherProfile() {
    return (
        <GradeLevelProfileContent />
    )
}