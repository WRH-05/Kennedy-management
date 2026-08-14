"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { GraduationCap, MapPin, Phone, Mail, School } from "lucide-react"
import { Teacher } from "@/services/teacherService"

interface TeacherInfoCardProps {
  teacher: Teacher
}

export function TeacherInfoCard({ teacher }: TeacherInfoCardProps) {
  const eligibleCourseNames = Array.from(
    new Set(
      teacher.teachers_course_eligibility?.flatMap(
        (tce) => (tce.course_eligibility.courses.name ? [tce.course_eligibility.courses.name] : [])
      ) ?? []
    )
  )

  const eligibleClassCombinations = Array.from(
    new Set(
      teacher.teachers_course_eligibility?.flatMap((tce) => {
        const courseName = tce.course_eligibility.courses.name
        const gradeLevelName = tce.course_eligibility.grade_levels?.name
        const combinedName = gradeLevelName ? `${courseName} (${gradeLevelName})` : courseName
        return combinedName ? [combinedName] : []
      }) ?? []
    )
  )

  const renderBadges = (items: string[], variant: "default" | "secondary") => {
    const validItems = items.filter((item) => item && item.trim())
    if (validItems.length === 0) {
      return <p className="text-gray-600">Not specified</p>
    }
    return validItems.map((item, idx) => (
      <Badge key={idx} variant={variant}>
        {item.trim()}
      </Badge>
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2" />
          Teacher Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label>Full Name</Label>
          <p className="text-lg font-semibold">{teacher.name}</p>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <Label>Address</Label>
            <p className="text-gray-600">{teacher.address || 'Not provided'}</p>
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex items-center space-x-3">
          <Phone className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <Label>Phone Number</Label>
            <p className="text-gray-600">{teacher.phone || 'Not provided'}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <Label>Email</Label>
            <p className="text-gray-600">{teacher.email || 'Not provided'}</p>
          </div>
        </div>

        {/* School */}
        <div className="flex items-start space-x-3">
          <School className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <Label>School</Label>
            <p className="text-gray-600">{teacher.school || 'Not provided'}</p>
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <Label>Subjects</Label>
          <div className="flex flex-wrap gap-2">
            {renderBadges(eligibleCourseNames, "default")}
          </div>
        </div>

        {/* Eligible Classes & Grades */}
        <div className="space-y-2">
          <Label>Eligible Classes & Grades</Label>
          <div className="flex flex-wrap gap-2">
            {renderBadges(eligibleClassCombinations, "secondary")}
          </div>
        </div>

        {/* Join Date */}
        <div className="space-y-2">
          <Label>Join Date</Label>
          <p className="text-gray-600">
            {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
