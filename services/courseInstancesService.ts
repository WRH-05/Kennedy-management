import { createClient } from "@/lib/supabase/client"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

const supabase = createClient();

// 1. Explicitly type your extended/enriched structures
export type CourseInstanceWithEnrichment = Tables<"course_instances"> & {
    student_ids: string[];
    teachers?: Tables<"teachers"> | null;
};

export type CourseInstanceDetail = Tables<"course_instances"> & {
    course_schedule: Tables<"course_schedule">[];
    teachers: Tables<"teachers">;
};

// Helper to handle duration transformations cleanly
const formatScheduleSlot = (slot: { startHour: string; duration: number; dayOfWeek: string }) => {
    const [hours, minutes] = slot.startHour.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + (slot.duration * 60);
    const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const endMins = (totalMinutes % 60).toString().padStart(2, "0");
    
    const cleanStart = slot.startHour.includes(':00') ? slot.startHour : `${slot.startHour}:00`;
    const cleanEnd = `${endHours}:${endMins}:00`;

    return {
        day: slot.dayOfWeek,
        start_time: cleanStart,
        end_time: cleanEnd
    };
};

export const courseInstancesService = {
    async getAllCourseInstances(
        page = 1,
        pageSize = 0,
        includeArchived = false
    ): Promise<{ data: CourseInstanceWithEnrichment[]; total: number; page: number; pageSize: number }> {

        let query = supabase
            .from('course_instances')
            .select('*, teachers(*)', { count: 'exact' });

        if (!includeArchived) {
            query = query.eq('archived', false);
        }

        query = query.order('created_at', { ascending: false });

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }

        const { data, count } = await query.throwOnError();

        // Optimized batch enrichment instead of N+1 requests
        const enrichedData = await this.enrichCoursesWithStudentsBatch(data || []);
        const totalCount = count !== null ? count : (data?.length || 0);

        return {
            data: enrichedData,
            total: totalCount,
            page,
            pageSize: pageSize > 0 ? pageSize : totalCount,
        };
    },

    async getCourseInstanceById(id: string): Promise<CourseInstanceDetail> {
        const { data } = await supabase
            .from('course_instances')
            .select(`*, course_schedule (*), teachers (*)`)
            .eq('id', id)
            .single()
            .throwOnError();

        return data;
    },

    async getCourseInstancesByTeacherId(teacherId: string): Promise<CourseInstanceWithEnrichment[]> {
        const { data } = await supabase
            .from('course_instances')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('archived', false)
            .order('created_at', { ascending: false })
            .throwOnError();

        return await this.enrichCoursesWithStudentsBatch(data || []);
    },

    async getCourseInstancesByStudentId(studentId: string): Promise<CourseInstanceWithEnrichment[]> {
        const { data: enrollments } = await supabase
            .from('course_enrollments')
            .select(`course_id, course_instances!inner (*, teachers(*))`)
            .eq('student_id', studentId)
            .eq('course_instances.archived', false)
            .order('course_instances(created_at)', { ascending: false })
            .throwOnError();

        // Handle structural variation from joins safely
        const instances = (enrollments || [])
            .map(e => e.course_instances)
            .filter(Boolean);

        return await this.enrichCoursesWithStudentsBatch(instances);
    },

    async getCourseInstanceEnrollments(courseId: string): Promise<Tables<"course_enrollments">[]> {
        const { data } = await supabase
            .from('course_enrollments')
            .select('*')
            .eq('course_id', courseId)
            .order('enrolled_at', { ascending: false })
            .throwOnError();

        return data || [];
    },

    async enrollStudent(courseId: string, studentId: string, firstBillingId: string) {
        const { data } = await supabase
            .rpc('enroll_student_with_billing', {
                p_course_id: courseId,
                p_student_id: studentId,
                p_first_billing_id: firstBillingId
            })
            .throwOnError();

        return data;
    },

    async unenrollStudent(courseId: string, studentId: string): Promise<boolean> {
        await supabase
            .from('course_enrollments')
            .update({ status: 'dropped' })
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .throwOnError();

        return true;
    },

    async addCourseInstance(instanceData: TablesInsert<"course_instances">, scheduleSlots: any[]) {
        const schedulesToInsert = (scheduleSlots || []).map(formatScheduleSlot);

        const { data } = await supabase.rpc('add_course_instance_with_schedule', {
            p_instance: {
                teacher_id: instanceData.teacher_id,
                subject: instanceData.subject,
                school_year: instanceData.school_year,
                percentage_cut: instanceData.percentage_cut,
                price: instanceData.price,
                monthly_price: instanceData.monthly_price
            },
            p_schedules: schedulesToInsert
        })
        .throwOnError();

        return data;
    },

    async updateCourseInstance(id: string, updatedData: TablesUpdate<"course_instances">, scheduleSlots: any[]) {
        const schedulesToInsert = scheduleSlots ? scheduleSlots.map(formatScheduleSlot) : null;

        const { data } = await supabase.rpc('update_course_instance_with_schedule', {
            p_course_id: id,
            p_updated_data: updatedData,
            p_schedules: schedulesToInsert 
        })
        .throwOnError();

        return data;
    },

    async archiveCourse(id: string): Promise<Tables<"course_instances">> {
        const { data } = await supabase
            .from('course_instances')
            .update({
                archived: true,
                archived_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()
            .throwOnError();

        return data;
    },

    async unarchiveCourse(id: string): Promise<Tables<"course_instances">> {
        const { data } = await supabase
            .from('course_instances')
            .update({
                archived: false,
                archived_date: null
            })
            .eq('id', id)
            .select()
            .single()
            .throwOnError();

        return data;
    },

    // 2. Batching Strategy to crush the N+1 problem completely
    async enrichCoursesWithStudentsBatch(courseInstances: any[]): Promise<CourseInstanceWithEnrichment[]> {
        if (!courseInstances || courseInstances.length === 0) return [];

        const courseIds = courseInstances.map(c => c.id);

        // Single query to fetch ALL enrollments for ALL requested courses at once
        const { data: allEnrollments } = await supabase
            .from('course_enrollments')
            .select('course_id, student_id')
            .in('course_id', courseIds);

        // Map course IDs to an array of student IDs for ultra-fast matching
        const enrollmentMap: Record<string, string[]> = {};
        allEnrollments?.forEach(enrollment => {
            if (!enrollmentMap[enrollment.course_id]) {
                enrollmentMap[enrollment.course_id] = [];
            }
            enrollmentMap[enrollment.course_id].push(enrollment.student_id);
        });

        return courseInstances.map(course => ({
            ...course,
            student_ids: enrollmentMap[course.id] || []
        }));
    }
}