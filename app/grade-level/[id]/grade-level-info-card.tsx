"use client"

import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"
import { Tables } from "@/types/database.types"
import { formatCourseType } from "@/lib/course-display"

interface GradeLevelInfoCardProps {
    gradeLevel: Tables<"grade_levels">
}

export function GradeLevelInfoCard({ gradeLevel }: GradeLevelInfoCardProps) {
    return (
        <Card>
            <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="text-xs text-muted-foreground">Grade Level</p>
                        <p className="text-lg font-semibold">{gradeLevel.name}</p>
                    </div>
                </div>
                <span className="text-sm text-muted-foreground">{formatCourseType(gradeLevel.type)}</span>
            </CardContent>
        </Card>
    )
}
