import { createClient } from "@/lib/supabase/client"
import { getSessionDates } from "@/lib/schedule"

const supabase = createClient()

export type AttendanceStatus = "present" | "absent" | "excused"
export type TeacherAttendanceStatus = "present" | "absent" | "cancelled"

export interface CourseAttendanceRecord {
  id?: string
  course_instance_id: string
  student_id: string
  billing_period_id?: string | null
  session_date: string
  status: AttendanceStatus
  notes?: string | null
}

export interface TeacherAttendanceRecord {
  id?: string
  course_instance_id: string
  teacher_id: string
  billing_period_id?: string | null
  session_date: string
  status: TeacherAttendanceStatus
  notes?: string | null
}

export interface AttendanceMatrixStudent {
  student_id: string
  name: string
  enrolled_at: string | null
}

export interface AttendanceMatrix {
  students: AttendanceMatrixStudent[]
  sessionDates: string[]
  studentRows: CourseAttendanceRecord[]
  teacherRows: TeacherAttendanceRecord[]
  billingPeriod: { id: string; start_date: string; end_date: string } | null
}

export interface AttendanceStats {
  present: number
  absent: number
  excused: number
  total: number
  rate: number
  history: { session_date: string; status: string; course_instance_id: string }[]
}

export const attendanceService = {
  async getAttendanceMatrix(courseInstanceId: string, billingPeriodId: string): Promise<AttendanceMatrix> {
    const [courseData, billingData, enrollmentsData, studentRowsData, teacherRowsData] = await Promise.all([
      supabase
        .from("course_instances")
        .select("id, course_schedule(*)")
        .eq("id", courseInstanceId)
        .single()
        .throwOnError(),
      supabase
        .from("billing_periods")
        .select("*")
        .eq("id", billingPeriodId)
        .single()
        .throwOnError(),
      supabase
        .from("course_enrollments")
        .select("student_id, enrolled_at, students(name)")
        .eq("course_id", courseInstanceId)
        .eq("status", "enrolled")
        .throwOnError(),
      (supabase as any)
        .from("course_attendance")
        .select("*")
        .eq("course_instance_id", courseInstanceId)
        .eq("billing_period_id", billingPeriodId)
        .throwOnError(),
      (supabase as any)
        .from("teacher_attendance")
        .select("*")
        .eq("course_instance_id", courseInstanceId)
        .eq("billing_period_id", billingPeriodId)
        .throwOnError(),
    ])

    const schedules = (courseData as any)?.data?.course_schedule || []
    const bp = (billingData as any)?.data || null
    const sessionDates = bp?.start_date && bp?.end_date
      ? getSessionDates(schedules, bp.start_date, bp.end_date)
      : []

    const students: AttendanceMatrixStudent[] = (((enrollmentsData as any)?.data || []) as any[]).map((e: any) => ({
      student_id: e.student_id,
      name: e.students?.name || "Unknown Student",
      enrolled_at: e.enrolled_at,
    }))

    return {
      students,
      sessionDates,
      studentRows: (((studentRowsData as any)?.data || []) as CourseAttendanceRecord[]),
      teacherRows: (((teacherRowsData as any)?.data || []) as TeacherAttendanceRecord[]),
      billingPeriod: bp ? { id: bp.id, start_date: bp.start_date, end_date: bp.end_date } : null,
    }
  },

  async upsertStudentAttendance(records: CourseAttendanceRecord[]): Promise<CourseAttendanceRecord[]> {
    if (!records || records.length === 0) return []
    const { data } = await (supabase as any)
      .from("course_attendance")
      .upsert(records, { onConflict: "course_instance_id,student_id,session_date" })
      .throwOnError()
    return data || []
  },

  async upsertTeacherAttendance(record: TeacherAttendanceRecord): Promise<TeacherAttendanceRecord> {
    const { data } = await (supabase as any)
      .from("teacher_attendance")
      .upsert(record, { onConflict: "course_instance_id,teacher_id,session_date" })
      .throwOnError()
    return data
  },

  async getStudentAttendanceStats(studentId: string): Promise<AttendanceStats> {
    const [enrollmentsData, attendanceData] = await Promise.all([
      supabase
        .from("course_enrollments")
        .select("course_id, enrolled_at")
        .eq("student_id", studentId)
        .throwOnError(),
      (supabase as any)
        .from("course_attendance")
        .select("*")
        .eq("student_id", studentId)
        .throwOnError(),
    ])

    const enrolledAtByCourse = new Map<string, string>()
    for (const e of (((enrollmentsData as any)?.data || []) as any[])) {
      enrolledAtByCourse.set(e.course_id, e.enrolled_at)
    }

    const rows = (((attendanceData as any)?.data || []) as CourseAttendanceRecord[])
    const eligible = rows.filter((r) => {
      const enrolledAt = enrolledAtByCourse.get(r.course_instance_id)
      if (!enrolledAt) return true
      return r.session_date >= enrolledAt.slice(0, 10)
    })

    const present = eligible.filter((r) => r.status === "present").length
    const absent = eligible.filter((r) => r.status === "absent").length
    const excused = eligible.filter((r) => r.status === "excused").length
    const total = present + absent + excused
    const rate = total > 0 ? Math.round((present / total) * 100) : 0

    const history = eligible
      .slice()
      .sort((a, b) => b.session_date.localeCompare(a.session_date))
      .slice(0, 10)
      .map((r) => ({
        session_date: r.session_date,
        status: r.status,
        course_instance_id: r.course_instance_id,
      }))

    return { present, absent, excused, total, rate, history }
  },
}
