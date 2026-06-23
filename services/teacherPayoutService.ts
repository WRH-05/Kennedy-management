import { supabase } from "@/lib/supabase"

export const teacherPayoutService = {
    async getAllTeachersPayouts(
        page = 1,
        pageSize = 0
    ) {
        let query = supabase
            .from('teacher_payouts')
            .select(`
                    *,
                    teachers (name),
                    profiles!teacher_payouts_recorded_by_id_fkey (full_name)
                `, { count: pageSize > 0 ? 'exact' : 'estimated' })

        query.order('created_at', { ascending: false });

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }

        const { data, count } = await query.throwOnError();
        const finalData = data || [];

        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };
    },
    // Change for full update
    async updatePayoutStatus(id: string, status: string) {
        const updateData = {
            status,
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
        const { data } = await supabase
            .from('teacher_payouts')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .throwOnError()

        return data || []
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

    async payTeacherPayout(paymentId: string) {

        const { data, error } = await supabase
            .from('teacher_payouts')
            .update({
                status: 'paid',
            })
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async denyTeacherPayout(paymentId: string) {

        const { data, error } = await supabase
            .from('teacher_payouts')
            .update({
                status: 'cancelled',
            })
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async recordTeacherPayout(teacherId: string, amount: number, percentage = 50, totalGenerated = 0, billingPeriodId = null) {

        const { data, error } = await supabase
            .from('teacher_payouts')
            .insert([{
                teacher_id: teacherId,
                amount: amount || 0,
                percentage: percentage,
                total_generated: totalGenerated,
                status: 'pending',
                billing_period_id: billingPeriodId,
            }])
            .select()
            .single()

        if (error) throw error
        return data
    },
}