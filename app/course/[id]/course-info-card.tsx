"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap } from "lucide-react"
import { Tables } from "@/types/database.types"
import { formatCourseType } from "@/lib/course-display"

interface CourseInfoCardProps {
    course: Tables<"courses">
}

export function CourseInfoCard({ course }: CourseInfoCardProps) {
    return (
        <Card>
            <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="text-xs text-muted-foreground">Course</p>
                        <p className="text-lg font-semibold">{course.name}</p>
                    </div>
                </div>
                <Badge variant={course.type === "academic" ? "default" : "secondary"}>
                    {formatCourseType(course.type)}
                </Badge>
            </CardContent>
        </Card>
    )
}
