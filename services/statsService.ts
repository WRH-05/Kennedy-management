import { createClient } from "@/lib/supabase/client"
import { getCourseDisplayName } from "@/lib/course-display"

const supabase = createClient()

export type DateRangeKey = "last30" | "thisCycle" | "allTime"

export interface TopClass {
  id: string
  name: string
  teacher: string
  enrolled: number
  capacity: number | null
}

export interface RecentCollection {
  id: string
  amount: number
  payment_date: string | null
  student_name: string
}

export interface StatsData {
  totalIncome: number
  tuitionRevenue: number
  registrationFees: number
  registrationPaidCount: number
  registrationUnpaidCount: number
  teacherExpenses: number
  operationalExpenses: number
  netProfit: number
  activeStudents: number
  activeEnrolled: number
  droppedStudents: number
  fixedSalaryPayouts: number
  percentagePayouts: number
  totalTeachers: number
  totalCourses: number
  topClasses: TopClass[]
  recentCollections: RecentCollection[]
}

interface RangeStart {
  iso: string | null   // for timestamptz columns
  date: string | null  // for date columns
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function rangeStart(range: DateRangeKey): RangeStart {
  if (range === "allTime") return { iso: null, date: null }

  const now = new Date()
  const start =
    range === "last30"
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
      : new Date(now.getFullYear(), now.getMonth(), 1)

  const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
  return { iso: start.toISOString(), date }
}

export const statsService = {
  async getStats(range: DateRangeKey): Promise<StatsData> {
    const start = rangeStart(range)

    const paymentsQuery = (() => {
      let q = supabase
        .from("student_payments")
        .select("id, amount, source, status, payment_date, students(name)")
        .eq("status", "paid")
        .order("payment_date", { ascending: false })
      if (start.iso) q = q.gte("payment_date", start.iso)
      return q
    })()

    const payoutsQuery = (() => {
      let q = supabase
        .from("teacher_payouts")
        .select("amount, status, payment_date, created_at, course_instances(compensation_type)")
        .eq("status", "paid")
      return q
    })()

    const expensesQuery = (() => {
      let q = (supabase as any).from("school_expenses").select("amount, expense_date")
      if (start.date) q = q.gte("expense_date", start.date)
      return q
    })()

    const [paymentsRes, payoutsRes, expensesRes, studentsRes, enrollmentsRes, instancesRes, teachersCountRes, coursesCountRes] = await Promise.all([
      paymentsQuery.throwOnError(),
      payoutsQuery.throwOnError(),
      expensesQuery.throwOnError(),
      supabase.from("students").select("id, registration_fee_paid").eq("archived", false).throwOnError(),
      supabase.from("course_enrollments").select("course_id, student_id, status").throwOnError(),
      supabase
        .from("course_instances")
        .select("id, display_name, max_students, teachers(name), course_eligibility(courses(name), grade_levels(name))")
        .eq("archived", false)
        .throwOnError(),
      supabase.from("teachers").select("id", { count: "exact", head: true }).eq("archived", false).throwOnError(),
      supabase.from("courses").select("id", { count: "exact", head: true }).throwOnError(),
    ])

    const payments: any[] = paymentsRes.data || []
    const payouts: any[] = payoutsRes.data || []
    const expenses: any[] = expensesRes.data || []
    const students: any[] = studentsRes.data || []
    const enrollments: any[] = enrollmentsRes.data || []
    const instances: any[] = instancesRes.data || []
    const totalTeachers = teachersCountRes.count ?? 0
    const totalCourses = coursesCountRes.count ?? 0

    // Financial totals (paid student payments split by source)
    let tuitionRevenue = 0
    let registrationFees = 0
    for (const p of payments) {
      const amount = Number(p.amount) || 0
      if (p.source === "registration") registrationFees += amount
      else tuitionRevenue += amount
    }
    const totalIncome = tuitionRevenue + registrationFees

    // Teacher expenses + compensation split (fixed salary vs percentage share)
    let teacherExpenses = 0
    let fixedSalaryPayouts = 0
    let percentagePayouts = 0
    for (const t of payouts) {
      const effectiveDate = (t.payment_date || t.created_at || "").slice(0, 10)
      if (start.date && effectiveDate && effectiveDate < start.date) continue
      const amount = Number(t.amount) || 0
      teacherExpenses += amount
      if (t.course_instances?.compensation_type === "fixed_salary") fixedSalaryPayouts += amount
      else percentagePayouts += amount
    }

    // Operational expenses (sum of school_expenses in range)
    let operationalExpenses = 0
    for (const ex of expenses) {
      operationalExpenses += Number(ex.amount) || 0
    }

    // Student metrics (current state, not date-bound)
    const activeStudents = students.length
    const registrationPaidCount = students.filter((s) => s.registration_fee_paid).length
    const registrationUnpaidCount = activeStudents - registrationPaidCount

    const enrolledSet = new Set<string>()
    const droppedSet = new Set<string>()
    const enrollmentCounts: Record<string, number> = {}
    for (const e of enrollments) {
      if (e.status === "enrolled") {
        enrolledSet.add(e.student_id)
        enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1
      } else if (e.status === "dropped") {
        droppedSet.add(e.student_id)
      }
    }

    // Top 5 classes by enrollment count
    const topClasses: TopClass[] = instances
      .map((ci) => ({
        id: ci.id,
        name: getCourseDisplayName(ci),
        teacher: ci.teachers?.name || "—",
        enrolled: enrollmentCounts[ci.id] || 0,
        capacity: ci.max_students ?? null,
      }))
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 5)

    // Recent collections (last 5 paid payments in range)
    const recentCollections: RecentCollection[] = payments.slice(0, 5).map((p) => ({
      id: p.id,
      amount: Number(p.amount) || 0,
      payment_date: p.payment_date || null,
      student_name: p.students?.name || "—",
    }))

    return {
      totalIncome,
      tuitionRevenue,
      registrationFees,
      registrationPaidCount,
      registrationUnpaidCount,
      teacherExpenses,
      operationalExpenses,
      netProfit: totalIncome - teacherExpenses - operationalExpenses,
      activeStudents,
      activeEnrolled: enrolledSet.size,
      droppedStudents: droppedSet.size,
      fixedSalaryPayouts,
      percentagePayouts,
      totalTeachers,
      totalCourses,
      topClasses,
      recentCollections,
    }
  },
}
