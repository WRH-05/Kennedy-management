"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { GraduationCap } from "lucide-react"
import { Tables} from "@/types/database.types"

interface GradeLevelInfoCardProps {
    gradeLevel: Tables<"grade_levels">
}

export function GradeLevelInfoCard({ gradeLevel }: GradeLevelInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Grade Level Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <p className="text-lg font-semibold">{gradeLevel.name}</p>
                </div>
            </CardContent>
        </Card>
    )
}