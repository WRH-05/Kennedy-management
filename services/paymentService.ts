import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

export const paymentService = {

    async getAllPayments() {
        const [studentPayments, teacherPayouts] = await Promise.all([
            supabase.from('student_payments').select('*').order('payment_date', { ascending: false }),
            supabase.from('teacher_payouts').select('*').order('payment_date', { ascending: false })
        ])

        if (studentPayments.error) throw studentPayments.error
        if (teacherPayouts.error) throw teacherPayouts.error

        const allPayments = [
            ...(studentPayments.data || []).map(p => ({ ...p, type: 'student' })),
            ...(teacherPayouts.data || []).map(p => ({ ...p, type: 'teacher' }))
        ]

        return allPayments
    },


    async getBillingPeriods(courseId: string) {
        const { data } = await supabase
            .from('billing_periods')
            .select('*')
            .eq('course_id', courseId)
            .order('start_date', { ascending: false })
            .throwOnError()

        return data || []
    },

    // Transaction
    async createBillingPeriod(courseId: string, startDate: string, endDate: string) {

        const { data } = await supabase.rpc('create_billing_period_and_initialize', {
            p_course_id: courseId,
            p_start_date: startDate,
            p_end_date: endDate
        })
        .throwOnError();

        return data;
    }
}
