"use client"

import React, { Suspense, useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { ArrowLeft, Lock, CalendarDays, Pencil, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CourseInstanceDetail, courseInstancesService } from "@/services/courseInstancesService"
import { paymentService } from "@/services/paymentService"
import {
  attendanceService,
  AttendanceMatrix,
  AttendanceStatus,
  CourseAttendanceRecord,
  TeacherAttendanceStatus,
} from "@/services/attendanceService"
import { getCourseDisplayName } from "@/lib/course-display"
import { toast } from "@/hooks/use-toast"

const STUDENT_STATUS_META: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: "P", className: "bg-emerald-100 text-emerald-800 font-semibold" },
  absent: { label: "A", className: "bg-rose-100 text-rose-800 font-semibold" },
  excused: { label: "E", className: "bg-sky-100 text-sky-800 font-semibold" },
}

const STUDENT_STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
]

const TEACHER_STATUS_OPTIONS: { value: TeacherAttendanceStatus; label: string }[] = [
  { value: "present", label: "Present (Conducted)" },
  { value: "absent", label: "Absent" },
  { value: "cancelled", label: "Cancelled" },
]

const TEACHER_STATUS_META: Record<TeacherAttendanceStatus, { label: string; className: string }> = {
  present: { label: "P", className: "bg-emerald-100 text-emerald-800 font-semibold" },
  absent: { label: "A", className: "bg-rose-100 text-rose-800 font-semibold" },
  cancelled: { label: "C", className: "bg-amber-100 text-amber-800 font-semibold" },
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AttendanceContent courseInstanceId={id} />
    </Suspense>
  )
}

function AttendanceContent({ courseInstanceId }: { courseInstanceId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCycleSet = useRef(false)

  const [course, setCourse] = useState<CourseInstanceDetail | null>(null)
  const [billingPeriods, setBillingPeriods] = useState<any[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState("")
  const [matrix, setMatrix] = useState<AttendanceMatrix | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [drawerDate, setDrawerDate] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [teacherStatus, setTeacherStatus] = useState<TeacherAttendanceStatus>("present")
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({})

  const syncUrl = (cycleId: string, date: string | null) => {
    const qs = new URLSearchParams()
    if (cycleId) qs.set("cycle", cycleId)
    if (date) qs.set("date", date)
    const suffix = qs.toString() ? `?${qs.toString()}` : ""
    router.replace(`/course-instance/${courseInstanceId}/attendance${suffix}`, { scroll: false })
  }

  const handleCycleChange = (cycleId: string) => {
    setSelectedPeriodId(cycleId)
    setDrawerDate(null)
    syncUrl(cycleId, null)
  }

  const loadMatrix = useCallback(async (periodId: string) => {
    if (!periodId) return
    try {
      const m = await attendanceService.getAttendanceMatrix(courseInstanceId, periodId)
      setMatrix(m)
    } catch (error) {
      console.error("Failed to load attendance matrix:", error)
      setLoadError("Failed to load attendance matrix.")
    }
  }, [courseInstanceId])

  useEffect(() => {
    ;(async () => {
      try {
        const [courseData, bps] = await Promise.all([
          courseInstancesService.getCourseInstanceById(courseInstanceId),
          paymentService.getBillingPeriods(courseInstanceId),
        ])
        setCourse(courseData)
        setBillingPeriods(bps || [])
      } catch (error) {
        console.error("Failed to load attendance page:", error)
        setLoadError("Failed to load attendance data.")
      } finally {
        setLoading(false)
      }
    })()
  }, [courseInstanceId])

  // Reset the URL-seeding gate when navigating to a different course instance
  useEffect(() => {
    initialCycleSet.current = false
    setSelectedPeriodId("")
    setDrawerDate(null)
  }, [courseInstanceId])

  // Seed cycle + date from URL once billing periods are available
  useEffect(() => {
    if (billingPeriods.length > 0 && !initialCycleSet.current) {
      const cycleParam = searchParams.get("cycle")
      const validCycle = cycleParam ? billingPeriods.find((bp) => bp.id === cycleParam) : null
      const targetId = validCycle ? validCycle.id : billingPeriods[0].id
      setSelectedPeriodId(targetId)
      const dateParam = searchParams.get("date")
      if (dateParam) setDrawerDate(dateParam)
      initialCycleSet.current = true
    }
  }, [billingPeriods, searchParams])

  useEffect(() => {
    if (selectedPeriodId) loadMatrix(selectedPeriodId)
  }, [selectedPeriodId, loadMatrix])

  const selectedPeriod = billingPeriods.find((p) => p.id === selectedPeriodId)
  const isLocked = selectedPeriod && selectedPeriod.end_date ? todayStr() > selectedPeriod.end_date : false

  const isPreEnrollment = (student: AttendanceMatrix["students"][number], date: string) => {
    const enrolled = student.enrolled_at ? student.enrolled_at.slice(0, 10) : null
    return Boolean(enrolled && date < enrolled)
  }

  const getCellStatus = (studentId: string, date: string): AttendanceStatus | null => {
    const row = matrix?.studentRows.find((r) => r.student_id === studentId && r.session_date === date)
    return (row?.status as AttendanceStatus) || null
  }

  const openDrawer = (date: string) => {
    if (!matrix) return
    const teacherRow = matrix.teacherRows.find((r) => r.session_date === date)
    setTeacherStatus((teacherRow?.status as TeacherAttendanceStatus) || "present")
    const map: Record<string, AttendanceStatus> = {}
    matrix.studentRows
      .filter((r) => r.session_date === date)
      .forEach((r) => {
        map[r.student_id] = r.status
      })
    setStudentStatuses(map)
    setDrawerDate(date)
    syncUrl(selectedPeriodId, date)
  }

  const markAllPresent = () => {
    if (!drawerDate || !matrix) return
    const map: Record<string, AttendanceStatus> = {}
    matrix.students.forEach((s) => {
      if (!isPreEnrollment(s, drawerDate)) map[s.student_id] = "present"
    })
    setStudentStatuses(map)
  }

  const handleSave = async () => {
    if (!drawerDate || !selectedPeriodId || !course) return
    setSaving(true)
    try {
      const records: CourseAttendanceRecord[] = Object.entries(studentStatuses).map(([studentId, status]) => ({
        course_instance_id: courseInstanceId,
        student_id: studentId,
        billing_period_id: selectedPeriodId,
        session_date: drawerDate,
        status,
      }))
      await attendanceService.upsertStudentAttendance(records)

      await attendanceService.upsertTeacherAttendance({
        course_instance_id: courseInstanceId,
        teacher_id: course.teacher_id,
        billing_period_id: selectedPeriodId,
        session_date: drawerDate,
        status: teacherStatus,
      })

      toast({ title: "Attendance saved" })
      setDrawerDate(null)
      await loadMatrix(selectedPeriodId)
    } catch (error) {
      console.error("Failed to save attendance:", error)
      toast({ title: "Error", description: "Failed to save attendance.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push(`/course-instance/${courseInstanceId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Class Details
        </Button>
      </div>
    )
  }

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <TooltipProvider>
    <div>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/course-instance/${courseInstanceId}`)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Attendance Register</h1>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-lg">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  {getCourseDisplayName(course as any)}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Teacher: {(course.teachers as any)?.name || "-"}</p>
              </div>
              <div className="w-64">
                <Label className="text-xs text-muted-foreground">Billing Cycle</Label>
                <Select value={selectedPeriodId} onValueChange={handleCycleChange}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select Cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingPeriods.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.start_date} → {p.end_date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              size="sm"
              className="mb-4"
              disabled={isLocked || !matrix?.sessionDates.includes(todayStr())}
              onClick={() => openDrawer(todayStr())}
            >
              Take Today's Attendance
            </Button>

            {isLocked && selectedPeriod && (
              <Alert className="mb-4 border-amber-300 bg-amber-50">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-amber-800">
                  Billing Cycle Ended ({selectedPeriod.start_date} - {selectedPeriod.end_date}) — Attendance records for this cycle are locked.
                </AlertDescription>
              </Alert>
            )}

            {!matrix ? (
              <p className="text-center py-10 text-muted-foreground">Loading attendance...</p>
            ) : matrix.students.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No enrolled students for this cycle.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Student</TableHead>
                      {matrix.sessionDates.map((date) => (
                        <TableHead key={date} className="text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="group p-0 h-auto font-bold text-slate-900 rounded hover:bg-slate-200 hover:text-slate-950 transition-colors"
                                disabled={isLocked}
                                onClick={() => openDrawer(date)}
                              >
                                {formatDayLabel(date)}
                                <Pencil className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Click date header to open daily attendance drawer</TooltipContent>
                          </Tooltip>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium min-w-[180px]">Teacher</TableCell>
                      {matrix.sessionDates.map((date) => {
                        const tStatus = matrix.teacherRows.find((r) => r.session_date === date)?.status
                        return tStatus ? (
                          <TableCell key={date} className="text-center">
                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded text-xs ${TEACHER_STATUS_META[tStatus].className}`}>
                              {TEACHER_STATUS_META[tStatus].label}
                            </span>
                          </TableCell>
                        ) : (
                          <TableCell key={date} className="text-center text-slate-300">—</TableCell>
                        )
                      })}
                    </TableRow>
                    {matrix.students.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell className="font-medium min-w-[180px]">{student.name}</TableCell>
                        {matrix.sessionDates.map((date) => {
                          const status = getCellStatus(student.student_id, date)
                          if (isPreEnrollment(student, date)) {
                            return (
                              <TableCell key={date} className="text-center">
                                <span className="inline-flex items-center justify-center h-6 w-9 rounded bg-slate-100 text-slate-400 text-xs font-medium">N/A</span>
                              </TableCell>
                            )
                          }
                          if (status) {
                            return (
                              <TableCell key={date} className="text-center">
                                <span className={`inline-flex items-center justify-center h-6 w-6 rounded text-xs ${STUDENT_STATUS_META[status].className}`}>
                                  {STUDENT_STATUS_META[status].label}
                                </span>
                              </TableCell>
                            )
                          }
                          return (
                            <TableCell key={date} className="text-center text-slate-300">—</TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Drawer open={!!drawerDate} onOpenChange={(open) => { if (!open) { setDrawerDate(null); syncUrl(selectedPeriodId, null) } }}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Mark Attendance — {drawerDate ? formatDayLabel(drawerDate) : ""}</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-5 overflow-y-auto">
            <div className="space-y-2">
              <Label>Teacher: {(course.teachers as any)?.name || "-"}</Label>
              <div className="flex flex-wrap gap-2">
                {TEACHER_STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={teacherStatus === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTeacherStatus(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={markAllPresent}>
              Mark All Present
            </Button>

            <div className="space-y-1">
              {matrix?.students
                .filter((s) => (drawerDate ? !isPreEnrollment(s, drawerDate) : true))
                .map((student) => (
                  <div key={student.student_id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <span className="text-sm font-medium">{student.name}</span>
                    <div className="flex gap-1">
                      {STUDENT_STATUS_OPTIONS.map((opt) => (
                        <Button
                          key={opt.value}
                          type="button"
                          variant={studentStatuses[student.student_id] === opt.value ? "default" : "outline"}
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => setStudentStatuses((prev) => ({ ...prev, [student.student_id]: opt.value }))}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={handleSave} disabled={saving || isLocked}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
    </TooltipProvider>
  )
}
