import { createClient } from "@/lib/supabase/client"
import { studentPaymentService, EnrichedStudentPayments } from "@/services/studentPaymentService"
import { teacherPayoutService, EnrichedTeacherPayout } from "@/services/teacherPayoutService"

const supabase = createClient()

export interface UnpaidStudent {
  id: string
  name: string
  phone: string | null
  created_at: string
  registration_fee_paid: boolean
}

export interface UnpaidOverview {
  unpaidTuition: EnrichedStudentPayments[]
  unpaidRegistration: UnpaidStudent[]
  pendingPayouts: EnrichedTeacherPayout[]
}

export const unpaidService = {
  async getUnpaidOverview(): Promise<UnpaidOverview> {
    const [tuitionRes, registrationRes, payoutsRes] = await Promise.all([
      studentPaymentService.getAllStudentsPayments(1, 0),
      supabase
        .from('students')
        .select('id, name, phone, created_at, registration_fee_paid')
        .eq('registration_fee_paid', false)
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .throwOnError(),
      teacherPayoutService.getAllTeachersPayouts(1, 0),
    ])

    const unpaidTuition = (tuitionRes.data || []).filter((p) => p.status === 'unpaid')
    const unpaidRegistration = (registrationRes.data || []) as UnpaidStudent[]
    const pendingPayouts = (payoutsRes.data || []).filter((p) => p.status === 'pending')

    return { unpaidTuition, unpaidRegistration, pendingPayouts }
  },
}
