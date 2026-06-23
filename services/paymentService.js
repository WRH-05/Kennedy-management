import { supabase } from "@/lib/supabase"

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
        ].sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at))

        return allPayments
    },


    async getBillingPeriods(courseId) {
        const { data, error } = await supabase
            .from('billing_periods')
            .select('*')
            .eq('course_id', courseId)
            .order('start_date', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Transaction
    async createBillingPeriod(courseId, startDate, endDate) {
        try {
            const { data: billingPeriod, error: billingError } = await supabase
                .from('billing_periods')
                .insert([{
                    course_id: courseId,
                    start_date: startDate,
                    end_date: endDate
                }])
                .select()
                .single()
                .throwOnError()


            const { data: courseInstance, error: courseInstanceError } = await supabase
                .from('course_instances')
                .select('*, teachers(*)')
                .eq('course_id', courseId)
                .single()
                .throwOnError()


            const payout = {
                teacher_id: courseInstance.teachers.id,
                course_id: courseId,
                billingPeriod: billingPeriod.id,
                amount: 0,
                status: 'pending'
            }

            const { error: payoutInsertError } = await supabase
                .from('teacher_payouts')
                .insert(payout)
                .throwOnError()


            const { data: enrollments, error: enrollmentError } = await supabase
                .from('course_enrollments')
                .select('student_id, status')
                .eq('course_id', courseId)
                .eq('status', 'enrolled')
                .throwOnError()


            if (enrollments && enrollments.length > 0) {

                const paymentRows = enrollments.map(enrollment => ({
                    student_id: enrollment.student_id,
                    course_id: courseId,
                    billing_period_id: billingPeriod.id,
                    amount: 0,
                    status: 'pending'
                }))

                const { error: paymentInsertError } = await supabase
                    .from('student_payments')
                    .insert(paymentRows)
                    .throwOnError()

            }

            return {
                ...billingPeriod,
                payments_generated: enrollments ? enrollments.length : 0
            }

        } catch (error) {
            console.error("Failed to create billing period and initialize payments:", error)
            throw error
        }
    }
}
