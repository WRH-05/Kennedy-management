import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/types/database.types";

const supabase = createClient();

// 1. Define explicit, discriminated union types for your unified transactions stream
export type EnrichedStudentPayment = Tables<"student_payments"> & {
    type: 'student';
    students?: Tables<"students"> | null;
    course_instances?: Tables<"course_instances"> | null;
    student_name?: string;
    course_display?: string;
    recorded_by_name?: string;
};

export type EnrichedTeacherPayout = Tables<"teacher_payouts"> & {
    type: 'teacher';
    teachers?: Tables<"teachers"> | null;
    recorded_by_name?: string;
};

export type UnifiedPaymentActivity = EnrichedStudentPayment | EnrichedTeacherPayout;

export const paymentService = {

    async getAllPayments(): Promise<UnifiedPaymentActivity[]> {
        // 2. Fetch data along with human-readable relation names instead of just UUIDs
        const [studentPayments, teacherPayouts] = await Promise.all([
            supabase
                .from('student_payments')
                .select('*, students(name), course_instances(id, display_name, course_eligibility(courses(name), grade_levels(name))), profiles!student_payments_recorded_by_fkey(full_name)')
                .order('payment_date', { ascending: false }),
            supabase
                .from('teacher_payouts')
                .select('*, teachers(name), profiles!teacher_payouts_recorded_by_fkey(full_name)')
                .order('payment_date', { ascending: false })
        ]);

        if (studentPayments.error) throw studentPayments.error;
        if (teacherPayouts.error) throw teacherPayouts.error;

        // 3. Map type discriminators cleanly to avoid forced 'as any' casting
        const mappedStudents: EnrichedStudentPayment[] = (studentPayments.data || []).map((p: any) => ({
            ...p,
            type: 'student' as const,
            student_name: p.students?.name || 'N/A',
            course_display: p.course_instances?.display_name
                || (p.course_instances?.course_eligibility
                    ? `${p.course_instances.course_eligibility.courses?.name || ''} - ${p.course_instances.course_eligibility.grade_levels?.name || ''}`
                    : 'N/A'),
            recorded_by_name: p.profiles?.full_name || '-',
        }));

        const mappedTeachers: EnrichedTeacherPayout[] = (teacherPayouts.data || []).map((p: any) => ({
            ...p,
            type: 'teacher' as const,
            recorded_by_name: p.profiles?.full_name || '-',
        }));

        // 4. Combine and sort by date chronologically so they can be rendered in a single feed
        const allPayments: UnifiedPaymentActivity[] = [...mappedStudents, ...mappedTeachers];

        return allPayments.sort((a, b) => {
            const dateA = new Date(a.payment_date || 0).getTime();
            const dateB = new Date(b.payment_date || 0).getTime();
            return dateB - dateA; // Newest transactions first
        });
    },

    async getBillingPeriods(courseId: string): Promise<Tables<"billing_periods">[]> {
        const { data } = await supabase
            .from('billing_periods')
            .select('*')
            .eq('course_id', courseId)
            .order('start_date', { ascending: false })
            .throwOnError();

        return data || [];
    },

    async createBillingPeriod(courseId: string, startDate: string, endDate: string): Promise<Tables<"billing_periods">> {
        const { data } = await supabase
            .rpc('create_billing_period_and_initialize', {
                p_course_id: courseId,
                p_start_date: startDate,
                p_end_date: endDate
            })
            .throwOnError();

        return data as Tables<"billing_periods">;
    }
}