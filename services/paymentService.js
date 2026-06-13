import { supabase } from "@/lib/supabase"
import { profileService } from "./profileService.js"
export const paymentService = {
    // Get all teacher payouts
    async getAllPayouts() {
        try {

            const { data, error } = await supabase
                .from('teacher_payouts')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Update payout status
    async updatePayoutStatus(id, status, approverName) {
        try {

            const updateData = {
                status,
                updated_at: new Date().toISOString(),
                ...(status === 'approved' && {
                    approved_by: approverName || 'Manager',
                    approved_date: new Date().toISOString().split('T')[0],
                    payment_date: new Date().toISOString().split('T')[0]
                }),
                ...(status === 'denied' && {
                    approved_by: null,
                    approved_date: null,
                    payment_date: null
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
        } catch (error) {
            throw error
        }
    },

    // Get revenue data
    async getRevenueData() {
        try {
            const { data, error } = await supabase
                .from('revenue')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Get pending payouts
    async getPendingPayouts() {
        try {

            const { data, error } = await supabase
                .from('teacher_payouts')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Get student payment history
    async getStudentPaymentHistory(studentId) {
        try {

            const { data, error } = await supabase
                .from('student_payments')
                .select('*')
                .eq('student_id', studentId)
                .order('payment_date', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Get professor payment history
    async getProfessorPaymentHistory(professorId) {
        try {

            const { data, error } = await supabase
                .from('teacher_payouts')
                .select('*')
                .eq('teacher_id', professorId)
                .order('payment_date', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Get student data for management
    async getStudentData() {
        try {

            const { data, error } = await supabase
                .from('students')
                .select(`
          *,
          student_payments (*)
        `)
                .eq('archived', false)

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Get teacher data for management
    async getTeacherData() {
        try {

            const { data, error } = await supabase
                .from('teachers')
                .select(`
          *,
          teacher_payouts (*)
        `)
                .eq('archived', false)

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Update payment status
    async updatePaymentStatus(paymentId, status, approverName = null) {
        try {

            const updateData = {
                status,
                ...(approverName && {
                    approved_by: approverName,
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
        } catch (error) {
            throw error
        }
    },

    // Get all payments combined and sorted by timeline
    async getAllPayments() {
        try {

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
        } catch (error) {
            throw error
        }
    },

    // Toggle student payment for course
    async toggleStudentPayment(courseId, studentId) {
        try {

            // Get current user profile for tracking
            const userProfile = await profileService.getCurrentUserProfile()

            // Get course info for price and details
            const { data: courseData, error: courseError } = await supabase
                .from('course_instances')
                .select('price, subject, school_year')
                .eq('id', courseId)

                .single()

            if (courseError) throw courseError

            // Get student info
            const { data: studentData, error: studentError } = await supabase
                .from('students')
                .select('name')
                .eq('id', studentId)

                .single()

            if (studentError) throw studentError

            const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

            // Check if payment exists in student_payments
            const { data: existingPayment, error: fetchError } = await supabase
                .from('student_payments')
                .select('*')
                .eq('course_id', courseId)
                .eq('student_id', studentId)

                .single()

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

            if (existingPayment) {
                const newStatus = existingPayment.status === 'paid' ? 'pending' : 'paid'
                const { data, error } = await supabase
                    .from('student_payments')
                    .update({
                        status: newStatus,
                        amount: courseData.price || 0,
                        month: currentMonth,
                        updated_at: new Date().toISOString(),
                        ...(newStatus === 'paid' && userProfile && {
                            recorded_by_id: userProfile.id,
                            recorded_by_name: userProfile.full_name
                        })
                    })
                    .eq('id', existingPayment.id)

                    .select()
                    .single()

                if (error) throw error

                // Update revenue table - check if exists first
                const { data: existingRevenue } = await supabase
                    .from('revenue')
                    .select('id')

                    .eq('student_id', studentId)
                    .eq('course_id', courseId)
                    .eq('month', currentMonth)
                    .single()

                if (existingRevenue) {
                    await supabase
                        .from('revenue')
                        .update({
                            student_name: studentData.name,
                            course: `${courseData.subject} - ${courseData.school_year}`,
                            amount: courseData.price || 0,
                            paid: newStatus === 'paid',
                            updated_at: new Date().toISOString(),
                            ...(newStatus === 'paid' && userProfile && {
                                recorded_by_id: userProfile.id,
                                recorded_by_name: userProfile.full_name
                            })
                        })
                        .eq('id', existingRevenue.id)
                } else {
                    await supabase
                        .from('revenue')
                        .insert({
                            
                            student_id: studentId,
                            course_id: courseId,
                            student_name: studentData.name,
                            course: `${courseData.subject} - ${courseData.school_year}`,
                            amount: courseData.price || 0,
                            month: currentMonth,
                            paid: newStatus === 'paid',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            ...(newStatus === 'paid' && userProfile && {
                                recorded_by_id: userProfile.id,
                                recorded_by_name: userProfile.full_name
                            })
                        })
                }

                return data
            } else {
                const { data, error } = await supabase
                    .from('student_payments')
                    .insert([{
                        course_id: courseId,
                        student_id: studentId,
                        
                        amount: courseData.price || 0,
                        month: currentMonth,
                        status: 'paid',
                        payment_date: new Date().toISOString(),
                        ...(userProfile && {
                            recorded_by_id: userProfile.id,
                            recorded_by_name: userProfile.full_name
                        })
                    }])
                    .select()
                    .single()

                if (error) throw error

                // Insert into revenue table - check if exists first
                const { data: existingRevenue } = await supabase
                    .from('revenue')
                    .select('id')

                    .eq('student_id', studentId)
                    .eq('course_id', courseId)
                    .eq('month', currentMonth)
                    .single()

                if (existingRevenue) {
                    await supabase
                        .from('revenue')
                        .update({
                            student_name: studentData.name,
                            course: `${courseData.subject} - ${courseData.school_year}`,
                            amount: courseData.price || 0,
                            paid: true,
                            updated_at: new Date().toISOString(),
                            ...(userProfile && {
                                recorded_by_id: userProfile.id,
                                recorded_by_name: userProfile.full_name
                            })
                        })
                        .eq('id', existingRevenue.id)
                } else {
                    await supabase
                        .from('revenue')
                        .insert({
                            
                            student_id: studentId,
                            course_id: courseId,
                            student_name: studentData.name,
                            course: `${courseData.subject} - ${courseData.school_year}`,
                            amount: courseData.price || 0,
                            month: currentMonth,
                            paid: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            ...(userProfile && {
                                recorded_by_id: userProfile.id,
                                recorded_by_name: userProfile.full_name
                            })
                        })
                }

                return data
            }
        } catch (error) {
            throw error
        }
    },

    // Toggle teacher payment for a course (creates/updates teacher_payouts)
    async toggleTeacherPayment(courseId, teacherId, amount, percentage) {
        try {

            // Get current user profile for tracking
            const userProfile = await profileService.getCurrentUserProfile()

            const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

            // Get teacher info
            const { data: teacherData, error: teacherError } = await supabase
                .from('teachers')
                .select('name')
                .eq('id', teacherId)

                .single()

            if (teacherError) throw teacherError

            // Check if payout exists for this teacher and month
            const { data: existingPayout, error: fetchError } = await supabase
                .from('teacher_payouts')
                .select('*')
                .eq('teacher_id', teacherId)

                .eq('month', currentMonth)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

            if (existingPayout) {
                // If a pending payout already exists, throw an error to prevent duplicates
                if (existingPayout.status === 'pending') {
                    throw new Error('PAYOUT_ALREADY_PENDING')
                }
                // If payout was approved/paid, allow creating a new pending request
                const isPaidState = existingPayout.status === 'paid' || existingPayout.status === 'approved'
                if (isPaidState) {
                    // Update to pending for re-review (e.g., amount changed)
                    const { data, error } = await supabase
                        .from('teacher_payouts')
                        .update({
                            status: 'pending',
                            amount: amount,
                            percentage: percentage,
                            payment_date: null, // Only set when manager approves
                            updated_at: new Date().toISOString(),
                            ...(userProfile && {
                                recorded_by_id: userProfile.id,
                                recorded_by_name: userProfile.full_name
                            })
                        })
                        .eq('id', existingPayout.id)

                        .select()
                        .single()

                    if (error) throw error
                    return { ...data, isPaid: false, alreadyExists: true }
                }
                // For any other status, don't allow duplicates
                throw new Error('PAYOUT_ALREADY_PENDING')
            } else {
                // Create new payout record with status 'pending' - manager must approve
                const { data, error } = await supabase
                    .from('teacher_payouts')
                    .insert([{
                        teacher_id: teacherId,
                        
                        professor_name: teacherData?.name || 'Unknown',
                        percentage: percentage,
                        amount: amount,
                        month: currentMonth,
                        status: 'pending',
                        payment_date: null, // Only set when manager approves
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        ...(userProfile && {
                            recorded_by_id: userProfile.id,
                            recorded_by_name: userProfile.full_name
                        })
                    }])
                    .select()
                    .single()

                if (error) throw error
                return { ...data, isPaid: false }
            }
        } catch (error) {
            throw error
        }
    },

    // Check if teacher is paid for current month
    async isTeacherPaidForMonth(teacherId, month = null) {
        try {

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
        } catch (error) {
            return false
        }
    },

    // Get student payments
    async getStudentPayments() {
        try {

            const { data, error } = await supabase
                .from('payments')
                .select(`
          *,
          students(name),
          course_instances(subject)
        `)

                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },
}
