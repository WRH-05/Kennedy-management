import { createClient } from "@/lib/supabase/client"
import { studentPaymentService, EnrichedStudentPayments } from "@/services/studentPaymentService"
import { getCourseDisplayName } from "@/lib/course-display"
import { computeTeacherEarnings, isPaymentOutstanding, sumCollectedPool } from "@/lib/payout"

const supabase = createClient()

export interface UnpaidStudent {
  id: string
  name: string
  phone: string | null
  created_at: string
  registration_fee_paid: boolean
}

export interface UnrequestedPayout {
  billing_period_id: string
  course_id: string
  start_date: string
  end_date: string
  teacher_id: string
  teacher_name: string
  class_name: string
  calculated_earnings: number
}

export interface UnpaidOverview {
  unpaidTuition: EnrichedStudentPayments[]
  unpaidRegistration: UnpaidStudent[]
  unrequestedPayouts: UnrequestedPayout[]
}

export const unpaidService = {
  async getUnpaidOverview(): Promise<UnpaidOverview> {
    const [tuitionRes, registrationRes, periodsRes, payoutsRes] = await Promise.all([
      studentPaymentService.getAllStudentsPayments(1, 0),
      supabase
        .from('students')
        .select('id, name, phone, created_at, registration_fee_paid')
        .eq('registration_fee_paid', false)
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .throwOnError(),
      supabase
        .from('billing_periods')
        .select('id, course_id, start_date, end_date, course_instances(*, teachers(name), course_eligibility(courses(name), grade_levels(name)))')
        .throwOnError(),
      supabase
        .from('teacher_payouts')
        .select('id, billing_period_id, status, amount')
        .throwOnError(),
    ])

    const allPayments = tuitionRes.data || []

    // A fee is outstanding until it is paid or cancelled; `pending` and `unpaid`
    // both count as unpaid tuition.
    const unpaidTuition = allPayments.filter((p) => isPaymentOutstanding(p.status))
    const unpaidRegistration = (registrationRes.data || []) as UnpaidStudent[]

    const periods = (periodsRes.data || []) as any[]
    const payouts = (payoutsRes.data || []) as any[]

    // Tuition actually collected per billing cycle — the pool percentage teachers are paid from.
    const collectedPoolByPeriod = new Map<string, number>()
    for (const bp of periods) {
      collectedPoolByPeriod.set(
        bp.id,
        sumCollectedPool(allPayments.filter((p) => p.billing_period_id === bp.id))
      )
    }

    const unrequestedPayouts: UnrequestedPayout[] = []
    for (const bp of periods) {
      const ci = bp.course_instances
      if (!ci || ci.archived) continue

      const earnings = computeTeacherEarnings(ci, collectedPoolByPeriod.get(bp.id) || 0)

      const payoutRow = payouts.find((p) => p.billing_period_id === bp.id)
      const isUnrequested = earnings > 0 && (!payoutRow || payoutRow.status === 'unpaid' || Number(payoutRow.amount) === 0)
      if (!isUnrequested) continue

      unrequestedPayouts.push({
        billing_period_id: bp.id,
        course_id: bp.course_id,
        start_date: bp.start_date,
        end_date: bp.end_date,
        teacher_id: ci.teacher_id,
        teacher_name: ci.teachers?.name || 'Unknown',
        class_name: getCourseDisplayName(ci),
        calculated_earnings: earnings,
      })
    }

    unrequestedPayouts.sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''))

    return { unpaidTuition, unpaidRegistration, unrequestedPayouts }
  },
}
