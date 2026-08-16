import { createClient } from "@/lib/supabase/client"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";
import { activityLogService } from "@/services/activityLogService";

const supabase = createClient();

export type EnrichedStudentPayments = Tables<"student_payments"> & {
    students: Tables<"students">,
    profiles?: Tables<"profiles">,
    course_instances?: Tables<"course_instances"> | null,
    billing_periods?: Tables<"billing_periods"> | null
}

export const studentPaymentService = {
    async getStudentPaymentHistory(studentId: string) {
        const { data } = await supabase
            .from('student_payments')
            .select('*')
            .eq('student_id', studentId)
            .order('payment_date', { ascending: false })
            .throwOnError()

        return data || []
    },

    async getStudentData(billingPeriodId: string): Promise<EnrichedStudentPayments[]> {
        if (!billingPeriodId) return []

        const { data } = await supabase
            .from('student_payments')
            .select(`
                *,
                students (*)
            `)
            .eq('billing_period_id', billingPeriodId)
            .throwOnError()

        return data || []
    },

    async updatePaymentStatus(paymentId: string, status: string) {
        const { data, error } = await supabase
            .from('student_payments')
            .update({ status } as any)
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    },


    async getAllStudentsPayments(
        page = 1,
        pageSize = 0,
    ) {

        let query = supabase
            .from('student_payments')
            .select('*, students (*), course_instances (*), billing_periods (*), profiles!student_payments_recorded_by_fkey(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })

        query = query.order('created_at', { ascending: false });


        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }


        const { data, error, count } = await query;

        if (error) throw error
        const finalData: EnrichedStudentPayments[] = data || [];

        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };
    },

    async recordStudentPayment(courseId: string, studentId: string, billingPeriodId: string): Promise<TablesInsert<"student_payments">> {
        const { data } = await supabase
            .from('student_payments')
            .insert([{
                course_id: courseId,
                student_id: studentId,
                amount: 0,
                status: 'paid',
                payment_date: new Date().toISOString(),
                billing_period_id: billingPeriodId,
            }] as any)
            .select()
            .single()
            .throwOnError()

        return data
    },

    async updateRecordStudentPayment(courseId: string, studentId: string, billingPeriodId: string, updates: TablesUpdate<"student_payments"> = {}): Promise<Tables<"student_payments">> {

        const { data } = await supabase
            .from('student_payments')
            .update({
                ...updates
            })
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .eq('billing_period_id', billingPeriodId)
            .select()
            .single()
            .throwOnError()

        if (data?.status === 'paid') {
            const [{ data: student }, { data: course }] = await Promise.all([
                supabase.from('students').select('name').eq('id', studentId).maybeSingle(),
                supabase.from('course_instances').select('display_name').eq('id', courseId).maybeSingle(),
            ])

            const studentName = student?.name ?? 'Unknown'
            const className = course?.display_name ?? 'Unknown class'

            await activityLogService.logActivity({
                action_type: 'payment',
                title: `Tuition Payment: ${studentName} - ${className} (${data.amount ?? 0} DA)`,
                amount: data.amount ?? 0,
                entity_type: 'student',
                entity_id: data.student_id,
            })
        }

        return data
    },

    async payStudentPayment(paymentId: string) {

        const { data, error } = await supabase
            .from('student_payments')
            .update({
                status: 'paid',
            })
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        if (!data) return null

        const [{ data: student }, { data: course }] = await Promise.all([
            supabase.from('students').select('name').eq('id', (data as any).student_id).maybeSingle(),
            supabase.from('course_instances').select('display_name').eq('id', (data as any).course_id).maybeSingle(),
        ])

        const studentName = student?.name ?? 'Unknown'
        const className = course?.display_name ?? 'Unknown class'

        await activityLogService.logActivity({
            action_type: 'payment',
            title: `Tuition Payment: ${studentName} - ${className} (${data.amount ?? 0} DA)`,
            amount: data.amount ?? 0,
            entity_type: 'student',
            entity_id: data.student_id,
        })

        return data
    },

    async denyStudentPayment(paymentId: string) {

        const { data } = await supabase
            .from('student_payments')
            .update({
                status: 'cancelled',
            })
            .eq('id', paymentId)
            .select()
            .single()
            .throwOnError()

        return data
    },

    async getStudentPayments(student_id: string) {
        const { data, error } = await supabase
            .from('student_payments')
            .select(`
                *,
                students(name),
                course_instances(subject),
                profiles!student_payments_recorded_by_fkey (full_name)
            `)
            .eq('student_id', student_id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((payment) => ({
            ...payment,
            recorded_by_name: payment.profiles?.full_name || '-'
        }))
    },

    async getPaymentsByCourseId(courseId: string): Promise<Tables<"student_payments">[]> {
        const { data } = await supabase
            .from('student_payments')
            .select('*')
            .eq('course_id', courseId)
            .throwOnError()

        return data || []
    },

    async payRegistrationFee(studentId: string) {
        const { data: student } = await supabase
            .from('students')
            .select('name')
            .eq('id', studentId)
            .maybeSingle()

        // Mark registration fee as paid on the student record
        const { error: updateError } = await supabase
            .from('students')
            .update({ registration_fee_paid: true })
            .eq('id', studentId)
            .throwOnError()

        if (updateError) throw updateError

        // Read dynamic registration fee from school settings, default to 500 DA
        const { data: settings } = await (supabase as any)
            .from('school_settings')
            .select('default_registration_fee')
            .limit(1)
            .single()
        const fee = settings?.default_registration_fee || 500

        // Log the registration fee payment
        const { data, error } = await supabase
            .from('student_payments')
            .insert([{
                student_id: studentId,
                amount: fee,
                status: 'paid',
                source: 'registration',
                payment_date: new Date().toISOString(),
            }] as any)
            .select()
            .single()
            .throwOnError()

        if (error) throw error

        await activityLogService.logActivity({
            action_type: 'payment',
            title: `Registration Fee Paid: ${student?.name ?? 'Unknown'} (${fee} DA)`,
            amount: fee,
            entity_type: 'student',
            entity_id: studentId,
        })

        return data
    },
}