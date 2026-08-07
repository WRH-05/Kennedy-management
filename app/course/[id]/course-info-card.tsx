"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { GraduationCap, MapPin } from "lucide-react"
import { Tables, TablesUpdate } from "@/types/database.types"

interface CourseInfoCardProps {
    course: Tables<"courses">
}

export function CourseInfoCard({ course }: CourseInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Course Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <p className="text-lg font-semibold">{course.name}</p>
                </div>

                <div className="flex items-start space-x-3">
                    <div className="flex-1">
                        <Label>Type</Label>
                        <br />
                        <Badge variant={course.type === "academic" ? "default" : "secondary"}>
                            {course.type}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}