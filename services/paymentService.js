import { supabase } from "@/lib/supabase"
import { profileService } from "./profileService"

export const paymentService = {
    async getAllPayouts() {
        const { data, error } = await supabase
            .from('teacher_payouts')
            .select(`
                *,
                teachers (name),
                profiles!teacher_payouts_recorded_by_id_fkey (full_name)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((payout) => ({
            ...payout,
            professor_name: payout.teachers?.name || 'Unknown Teacher',
            recorded_by_name: payout.profiles?.full_name || '-'
        }))
    },

    async updatePayoutStatus(id, status, approverId) {
        const updateData = {
            status,
            updated_at: new Date().toISOString(),
            ...(status === 'approved' && {
                approved_by: approverId,
                approved_date: new Date().toISOString().split('T')[0]
            }),
            ...(status === 'paid' && {
                approved_by: approverId,
                payment_date: new Date().toISOString().split('T')[0]
            })
        }

        const { data, error } = await supabase
            .from('teacher_payouts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getPendingPayouts() {
        const { data, error } = await supabase
            .from('teacher_payouts')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getStudentPaymentHistory(studentId) {
        const { data, error } = await supabase
            .from('student_payments')
            .select('*')
            .eq('student_id', studentId)
            .order('payment_date', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getTeacherPaymentHistory(teacherId) {
        const { data, error } = await supabase
            .from('teacher_payouts')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('payment_date', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getStudentData(billingPeriodId) {
        if (!billingPeriodId) return []
        const { data, error } = await supabase
            .from('student_payments')
            .select(`
                *,
                students (*)
            `)
            .eq('billing_period_id', billingPeriodId)
        if (error) throw error
        return data || []
    },

    async getTeacherData() {
        const { data, error } = await supabase
            .from('teachers')
            .select(`
                *,
                teacher_payouts (*)
            `)
            .eq('archived', false)

        if (error) throw error
        return data || []
    },

    async updatePaymentStatus(paymentId, status, approverId = null) {
        const updateData = {
            status,
            updated_at: new Date().toISOString(),
            ...(approverId && status === 'paid' && {
                approved_by: approverId,
                approved_date: new Date().toISOString()
            })
        }

        const { data, error } = await supabase
            .from('student_payments')
            .update(updateData)
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    },

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


    async getAllStudentsPayments(
        page = 1,
        pageSize = 0,
    ) {

        let query = supabase
            .from('student_payments')
            .select('*, students (*), course_instances (*), billing_periods (*), profiles!student_payments_recorded_by_id_fkey(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })

        query = query.order('created_at', { ascending: false });


        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }


        const { data, error, count } = await query;

        if (error) throw error
        const finalData = data || [];

        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };
    },
    async getAllTeachersPayments(
        page = 1,
        pageSize = 0,
    ) {

        let query = supabase
            .from('teacher_payouts')
            .select('*, teachers (*), course_instances (*), billing_periods (*), profiles!teacher_payouts_recorded_by_id_fkey(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })

        query = query.order('created_at', { ascending: false });


        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }


        const { data, error, count } = await query;

        if (error) throw error
        const finalData = data || [];

        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };
    },

    async recordStudentPayment(courseId, studentId, billingPeriodId) {
        const userProfile = await profileService.getCurrentUserProfile()

        const { data, error } = await supabase
            .from('student_payments')
            .insert([{
                course_id: courseId,
                student_id: studentId,
                amount: 0,
                status: 'pending',
                billing_period_id: billingPeriodId,
                recorded_by_id: userProfile?.id || null
            }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateRecordStudentPayment(courseId, studentId, billingPeriodId, updates = {}) {

        const { data, error } = await supabase
            .from('student_payments')
            .update({
                ...updates
            })
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .eq('billing_period_id', billingPeriodId)
            .select()
            .single()

        if (error) throw error
        return data
    },
    async payStudentPayment(paymentId) {
        const userProfile = await profileService.getCurrentUserProfile()

        const { data, error } = await supabase
            .from('student_payments')
            .update({
                status: 'paid',
                approved_by: userProfile.id,
            })
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    },
    async payTeacherPayment(paymentId) {
        const userProfile = await profileService.getCurrentUserProfile()

        const { data, error } = await supabase
            .from('teacher_payouts')
            .update({
                status: 'paid',
                approved_by: userProfile.id,
                approved_date: Date.now(),
            })
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    },
    async denyStudentPayment(paymentId) {
        const userProfile = await profileService.getCurrentUserProfile()

        const { data, error } = await supabase
            .from('student_payments')
            .update({
                status: 'cancelled',
                approved_by: userProfile.id,
            })
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    },
    async denyTeacherPayment(paymentId) {
        const userProfile = await profileService.getCurrentUserProfile()

        const { data, error } = await supabase
            .from('teacher_payouts')
            .update({
                status: 'cancelled',
                approved_by: userProfile.id,
                approved_date: Date.now(),
            })
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async recordTeacherPayout(teacherId, amount, percentage = 50, totalGenerated = 0, billingPeriodId = null) {
        const userProfile = await profileService.getCurrentUserProfile()

        const { data, error } = await supabase
            .from('teacher_payouts')
            .insert([{
                teacher_id: teacherId,
                amount: amount || 0,
                percentage: percentage,
                total_generated: totalGenerated,
                status: 'pending',
                billing_period_id: billingPeriodId,
                recorded_by_id: userProfile?.id || null
            }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async isTeacherPaidForMonth(teacherId, month = null) {
        const targetMonth = month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

        const { data, error } = await supabase
            .from('teacher_payouts')
            .select('status')
            .eq('teacher_id', teacherId)
            .eq('month', targetMonth)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data?.status === 'paid' || data?.status === 'approved'
    },

    async getStudentPayments() {
        const { data, error } = await supabase
            .from('student_payments')
            .select(`
                *,
                students(name),
                course_instances(subject),
                profiles!student_payments_recorded_by_id_fkey (full_name)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((payment) => ({
            ...payment,
            recorded_by_name: payment.profiles?.full_name || '-'
        }))
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

            if (billingError) throw billingError

            const { data: enrollments, error: enrollmentError } = await supabase
                .from('course_enrollments')
                .select('student_id, status')
                .eq('course_id', courseId)
                .eq('status', 'enrolled')

            if (enrollmentError) throw enrollmentError

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

                if (paymentInsertError) throw paymentInsertError
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
