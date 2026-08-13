"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Edit3 } from "lucide-react"
import { formatScheduleString } from "@/lib/schedule"
import { CourseInstanceDetail } from "@/services/courseInstancesService"
import { UpdateCourseInstanceDialog } from "@/components/tabs/CourseInstancesTab/UpdateCourseInstanceDialog"
import { usePaginatedGradeLevels } from "@/hooks/useGradeLevels"

export function CourseInstancesInfoCard({
  courseInstances,
  onRefresh,
}: {
  courseInstances: CourseInstanceDetail
  onRefresh: () => void
}) {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { gradeLevels } = usePaginatedGradeLevels(1, 0)

  const title = courseInstances.display_name || courseInstances.course_eligibility?.courses?.name || "—"
  const gradeNames = courseInstances.grade_level_ids?.length
    ? courseInstances.grade_level_ids
        .map((id) => gradeLevels.find((gl) => gl.id === id)?.name)
        .filter((n): n is string => Boolean(n))
    : []
  const subtitle = gradeNames.length > 0
    ? gradeNames.join(", ")
    : (courseInstances.course_eligibility?.grade_levels?.name ?? "—")

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="flex items-center text-md font-medium">
            <BookOpen className="h-5 w-5 mr-2" /> Course Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit3 className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">
              {title}
            </h3>
            <p className="text-gray-600">
              {subtitle}
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Teacher:</span>{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => router.push(`/teacher/${courseInstances.teacher_id}`)}
              >
                {courseInstances.teachers?.name}
              </Button>
            </p>
            <p>
              <span className="font-medium">Schedule:</span>{" "}
              {formatScheduleString(courseInstances.course_schedule)}
            </p>
          </div>
        </CardContent>
      </Card>
      <UpdateCourseInstanceDialog
        courseInstanceId={courseInstances.id}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdated={onRefresh}
      />
    </>
  )
}
