import { createClient } from "@/lib/supabase/client"
import { Tables, TablesUpdate } from "@/types/database.types";
import { activityLogService } from "@/services/activityLogService";

const supabase = createClient();

export type EnrichedTeacherPayout = Tables<"teacher_payouts"> & {
    teachers?: Tables<"teachers">,
    profiles?: Tables<"profiles">,
    course_instances?: Tables<"course_instances"> & {
        course_eligibility?: {
            id?: string
            courses?: { name: string } | null
            grade_levels?: { name: string } | null
        } | null
    },
    billing_periods?: Tables<"billing_periods">
}

export const teacherPayoutService = {
    async getAllTeachersPayouts(
        page = 1,
        pageSize = 0
    ): Promise<{
        data: EnrichedTeacherPayout[];
        total: number;
        page: number;
        pageSize: number;
    }> {
        let query = supabase
            .from('teacher_payouts')
            .select(`
                    *,
                    teachers (*),
                    course_instances(*, course_eligibility(courses(name), grade_levels(name))),
                    billing_periods (*),
                    profiles!teacher_payouts_recorded_by_fkey (*)
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

    async getAllTeacherPayouts(courseId: string): Promise<EnrichedTeacherPayout[]> {
        let query = supabase
            .from('teacher_payouts')
            .select(`*, course_instances(*, course_eligibility(courses(name), grade_levels(name))), profiles!teacher_payouts_recorded_by_fkey (*)`)
            .eq('course_id', courseId)

        query.order('created_at', { ascending: false });


        const { data } = await query.throwOnError();

        return data || [];
    },

    // Change for full update
    async updatePayoutStatus(id: string, status: string): Promise<Tables<"teacher_payouts">> {
        const { data, error } = await supabase
            .from('teacher_payouts')
            .update({ status } as any)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updatePayout(id: string, updates: TablesUpdate<"teacher_payouts"> = {}): Promise<Tables<"teacher_payouts">> {
        const { data } = await supabase
            .from('teacher_payouts')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
            .throwOnError()

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

    async getTotalPaidPayouts(teacherId: string): Promise<number> {
        const { data } = await supabase
            .from('teacher_payouts')
            .select('amount')
            .eq('teacher_id', teacherId)
            .eq('status', 'paid')
            .throwOnError()

        return (data || []).reduce((sum, p) => sum + (p.amount || 0), 0)
    },
    async getAllTeachersPayments(
        page = 1,
        pageSize = 0,
    ) {

        let query = supabase
            .from('teacher_payouts')
            .select('*, teachers (*), course_instances(*, course_eligibility(courses(name), grade_levels(name))), billing_periods (*), profiles!teacher_payouts_recorded_by_fkey(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })

        query = query.order('created_at', { ascending: false });


        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }


        const { data, error, count } = await query;

        if (error) throw error
        const finalData: EnrichedTeacherPayout[] = data || [];

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
        if (!data) return null

        const { data: teacher } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', (data as any).teacher_id)
            .maybeSingle()

        await activityLogService.logActivity({
            action_type: 'payout_confirmed',
            title: `Teacher Payout Confirmed: ${teacher?.name ?? 'Unknown'} (${data.amount ?? 0} DA)`,
            amount: data.amount ?? 0,
            entity_type: 'teacher',
            entity_id: (data as any).teacher_id,
        })

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

    async recordTeacherPayout(amount: number, billingPeriodId: string, courseId: string) {

        const { data } = await supabase
            .from('teacher_payouts')
            .update({
                amount: amount,
                status: 'pending',
            })
            .eq('billing_period_id', billingPeriodId)
            .eq('course_id', courseId)
            .select()
            .single()
            .throwOnError()

        const { data: teacher } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', (data as any).teacher_id)
            .maybeSingle()

        await activityLogService.logActivity({
            action_type: 'payout_request',
            title: `Teacher Payout Requested: ${teacher?.name ?? 'Unknown'} (${amount} DA)`,
            amount: amount,
            entity_type: 'teacher',
            entity_id: (data as any).teacher_id,
        })

        return data
    },
}