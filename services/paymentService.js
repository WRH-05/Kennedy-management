import { supabase } from "@/lib/supabase"
import { profileService } from "./profileService.js"

export const paymentService = {
    // Get all teacher payouts
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

        // Enrich with teacher name and recorded by name for backward compatibility
        return (data || []).map((payout) => ({
            ...payout,
            professor_name: payout.teachers?.name || 'Unknown Teacher',
            recorded_by_name: payout.profiles?.full_name || '-'
        }))
    },

    // Update payout status
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

    // Get pending payouts
    async getPendingPayouts() {
        const { data, error } = await supabase
            .from('teacher_payouts')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get student payment history
    async getStudentPaymentHistory(studentId) {
        const { data, error } = await supabase
            .from('student_payments')
            .select('*')
            .eq('student_id', studentId)
            .order('payment_date', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get teacher payment history
    async getTeacherPaymentHistory(teacherId) {
        const { data, error } = await supabase
            .from('teacher_payouts')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('payment_date', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get student data for management
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

    // Get teacher data for management
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

    // Update student payment status
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

    // Get all payments combined and sorted by timeline
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

    // Record student payment for a course
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
        const userProfile = await profileService.getCurrentUserProfile()

        const { data, error } = await supabase
            .from('student_payments')
            .update({
                ...updates,s
            })
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .eq('billing_period_id', billingPeriodId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Record teacher payout for a course/billing period
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

    // Check if teacher is paid for current month
    async isTeacherPaidForMonth(teacherId, month = null) {
        const targetMonth = month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

        const { data, error } = await supabase
            .from('teacher_payouts')
            .select('status')
            .eq('teacher_id', teacherId)
            .eq('month', targetMonth)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        // Both 'paid' and 'approved' are terminal paid states
        return data?.status === 'paid' || data?.status === 'approved'
    },

    // Get student payments
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

        // Enrich with recorded_by_name for backward compatibility
        return (data || []).map((payment) => ({
            ...payment,
            recorded_by_name: payment.profiles?.full_name || '-'
        }))
    },

    // Get billing periods
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
            // 1. Create the billing period row
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

            // 2. Fetch all active student enrollments for this specific course
            // Adjust 'course_students' to match your actual junction table name
            const { data: enrollments, error: enrollmentError } = await supabase
                .from('course_enrollments')
                .select('student_id, status')
                .eq('course_id', courseId)
            // Optional: Only create bills for students who aren't dropped/cancelled
            // .eq('status', 'active') 

            if (enrollmentError) throw enrollmentError

            // 3. If there are students enrolled, bulk insert rows into the payments table
            if (enrollments && enrollments.length > 0) {

                // Map the enrollment data into rows matching your payments schema (Image 4)
                const paymentRows = enrollments.map(enrollment => ({
                    student_id: enrollment.student_id,
                    course_id: courseId,
                    billing_period_id: billingPeriod.id,
                    amount: 0, // IMPORTANT: Set your base price logic here (e.g., pulling from course table)
                    status: 'pending' // Or whatever default status string your app uses
                }))

                // Replace 'payments' with the exact name of your new image table
                const { error: paymentInsertError } = await supabase
                    .from('student_payments')
                    .insert(paymentRows)

                if (paymentInsertError) throw paymentInsertError
            }

            // Return the created billing period along with a success flag or confirmation
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
