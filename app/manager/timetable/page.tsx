"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTimetable } from "@/hooks/useTimetable"
import { usePaginatedGradeLevels } from "@/hooks/useGradeLevels"
import { usePaginatedCourses } from "@/hooks/useCourses"
import { usePaginatedTeachers } from "@/hooks/useTeachers"
import { VALID_WEEK_DAYS } from "@/lib/schedule"
import { getCourseDisplayName } from "@/lib/course-display"
import { TimetableInstance } from "@/services/timetableService"

const ALL = "all"

function capitalizeDay(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

function formatSlot(start: string | undefined, end: string | undefined): string {
  const s = start?.slice(0, 5) || "?"
  const e = end?.slice(0, 5) || "?"
  return `${s} - ${e}`
}

export default function TimetablePage() {
  const { instances, isLoading } = useTimetable()
  const { gradeLevels } = usePaginatedGradeLevels(1, 0)
  const { courses } = usePaginatedCourses(1, 0)
  const { teachers } = usePaginatedTeachers(1, 0)

  const [gradeFilter, setGradeFilter] = useState<string>(ALL)
  const [courseFilter, setCourseFilter] = useState<string>(ALL)
  const [teacherFilter, setTeacherFilter] = useState<string>(ALL)

  const filtered = useMemo(() => {
    return (instances as TimetableInstance[]).filter((ci) => {
      if (gradeFilter !== ALL) {
        const inGrade = (ci.grade_level_ids || []).includes(gradeFilter)
          || ci.course_eligibility?.grade_level_id === gradeFilter
        if (!inGrade) return false
      }
      if (courseFilter !== ALL) {
        if (ci.course_eligibility?.courses?.id !== courseFilter) return false
      }
      if (teacherFilter !== ALL) {
        if (ci.teacher_id !== teacherFilter) return false
      }
      return true
    })
  }, [instances, gradeFilter, courseFilter, teacherFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">School Timetable & Schedule</h1>
        <p className="text-sm text-muted-foreground">
          Weekly timetable grid of all active class sessions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="All Grade Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Grade Levels</SelectItem>
            {gradeLevels.map((g: any) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Courses</SelectItem>
            {courses.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={teacherFilter} onValueChange={setTeacherFilter}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="All Teachers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Teachers</SelectItem>
            {teachers.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {VALID_WEEK_DAYS.map((day) => {
            const dayInstances = filtered
              .map((ci) => ({
                ci,
                slots: (ci.course_schedule || []).filter((s) => s.day === day),
              }))
              .filter((x) => x.slots.length > 0)

            return (
              <Card key={day} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{capitalizeDay(day)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {dayInstances.length > 0 ? (
                    dayInstances.map(({ ci, slots }) => (
                      <div key={ci.id} className="rounded-md border p-2 space-y-1">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-left font-medium text-sm"
                          asChild
                        >
                          <Link href={`/course-instance/${ci.id}`}>
                            {getCourseDisplayName(ci)}
                          </Link>
                        </Button>
                        {slots.map((slot) => (
                          <div key={slot.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatSlot(slot.start_time, slot.end_time)}
                          </div>
                        ))}
                        <div className="text-xs text-muted-foreground">{ci.teachers?.name || "—"}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground">—</div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-lg text-gray-400">
          <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active class sessions match the current filters.</p>
        </div>
      )}
    </div>
  )
}
