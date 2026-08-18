import { createClient } from "@/lib/supabase/client"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { getCourseDisplayName } from "@/lib/course-display"
import { activityLogService } from "@/services/activityLogService"

const supabase = createClient();

// 1. Explicitly type your extended/enriched structures
export type CourseInstanceWithEnrichment = Tables<"course_instances"> & {
    student_ids: string[];
    teachers: Tables<"teachers">;
    course_eligibility: {
        id: string;
        courses: { name: string } | null;
        grade_levels: { name: string } | null;
    } | null;
};

export type CourseInstanceDetail = Tables<"course_instances"> & {
    course_schedule: Tables<"course_schedule">[];
    teachers: Tables<"teachers">;
    course_eligibility: {
        id: string;
        courses: { name: string } | null;
        grade_levels: { name: string } | null;
    } | null;
};

export type CourseInstancesResponse = Awaited<
    ReturnType<typeof courseInstancesService.getAllCourseInstances>
>

export type CourseInstance = CourseInstancesResponse["data"][number];

export type TodayScheduleItem = {
    courseInstanceId: string;
    displayName: string;
    teacherName: string;
    startTime: string;
    endTime: string;
};


export const courseInstancesService = {
    async getAllCourseInstances(
        page = 1,
        pageSize = 0,
        includeArchived = false
    ) {

        let query = supabase
            .from('course_instances')
            .select('*, teachers(*), course_eligibility(id, courses(*), grade_levels(*)), course_enrollments(*, students(*)), course_schedule(*)', { count: 'exact' });

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
        const enrichedData = data;
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
            .select(`*, course_schedule (*), teachers (*), course_eligibility(id, courses(*), grade_levels(*))`)
            .eq('id', id)
            .single()
            .throwOnError();

        return data;
    },

    async getCourseInstancesByTeacherId(teacherId: string): Promise<CourseInstanceWithEnrichment[]> {
        const { data } = await supabase
            .from('course_instances')
            .select('*, course_schedule(*), teachers(*), course_eligibility(id, courses(*), grade_levels(*))')
            .eq('teacher_id', teacherId)
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

    async getCourseInstancesByCourseId(courseId: string): Promise<CourseInstanceWithEnrichment[]> {
        const { data: eligibilities } = await supabase
            .from('course_eligibility')
            .select('id')
            .eq('course_id', courseId)
            .throwOnError();

        const eligibilityIds = (eligibilities || []).map((e) => e.id);

        if (eligibilityIds.length === 0) return [];

        const { data } = await supabase
            .from('course_instances')
            .select('*, teachers(*), course_eligibility(id, courses(*), grade_levels(*))')
            .in('course_eligibility_id', eligibilityIds)
            .eq('archived', false)
            .order('created_at', { ascending: false })
            .throwOnError();

        return await this.enrichCoursesWithStudentsBatch(data || []);
    },

    async getCourseInstancesByGradeLevelId(gradeLevelId: string): Promise<CourseInstanceWithEnrichment[]> {
        const { data } = await supabase
            .from('course_instances')
            .select('*, teachers(*), course_eligibility(id, courses(*), grade_levels(*))')
            .contains('grade_level_ids', [gradeLevelId])
            .eq('archived', false)
            .order('created_at', { ascending: false })
            .throwOnError();

        return await this.enrichCoursesWithStudentsBatch(data || []);
    },

    async getTodaysSchedule(day: string): Promise<TodayScheduleItem[]> {
        const { data } = await supabase
            .from('course_instances')
            .select('*, course_schedule!inner(*), teachers(name), course_eligibility(id, courses(name), grade_levels(name))')
            .eq('archived', false)
            .eq('course_schedule.day', day as any)
            .throwOnError();

        const rows: TodayScheduleItem[] = [];
        for (const ci of (data || []) as any[]) {
            const slots = (ci.course_schedule || []).filter((s: any) => s.day === day);
            for (const slot of slots) {
                rows.push({
                    courseInstanceId: ci.id,
                    displayName: getCourseDisplayName(ci),
                    teacherName: ci.teachers?.name || '-',
                    startTime: slot.start_time?.slice(0, 5) || '',
                    endTime: slot.end_time?.slice(0, 5) || '',
                });
            }
        }
        rows.sort((a, b) => a.startTime.localeCompare(b.startTime));
        return rows;
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

    async unenrollStudent(courseId: string, studentId: string, billingPeriodId?: string): Promise<boolean> {
        await supabase
            .from('course_enrollments')
            .update({ status: 'dropped' })
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .throwOnError();

        // Cancel ALL outstanding (non-paid) payments across ALL billing periods for this student
        await supabase
            .from('student_payments')
            .update({ status: 'cancelled' })
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .neq('status', 'paid')
            .throwOnError();

        return true;
    },

    async addCourseInstance(instanceData: TablesInsert<"course_instances">, scheduleSlots: TablesInsert<"course_schedule">[]) {

        const { data } = await supabase.rpc('add_course_instance_with_schedule', {
            p_instance: {
                teacher_id: instanceData.teacher_id,
                percentage_cut: instanceData.percentage_cut,
                course_eligibility_id: instanceData.course_eligibility_id,
                price: instanceData.price,
                monthly_price: instanceData.monthly_price,
                display_name: instanceData.display_name || null,
                compensation_type: instanceData.compensation_type || 'percentage',
                fixed_salary_amount: instanceData.fixed_salary_amount || null,
                is_individual: instanceData.is_individual || false,
                max_students: instanceData.max_students || null,
                grade_level_ids: instanceData.grade_level_ids || [],
            },
            p_schedules: scheduleSlots
        })
            .throwOnError();

        await activityLogService.logActivity({
            action_type: 'course_instance_created',
            title: `Class instance created: ${instanceData.display_name || 'Unknown'}`,
            entity_type: 'course_instance',
            entity_id: (data as any)?.id,
        });

        return data;
    },

    async updateCourseInstance(id: string, updatedData: TablesUpdate<"course_instances">, scheduleSlots: TablesUpdate<"course_schedule">[]) {

        const { data } = await supabase.rpc('update_course_instance_with_schedule', {
            p_course_id: id,
            p_updated_data: updatedData,
            p_schedules: scheduleSlots
        })
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

    async deleteCourseInstance(id: string): Promise<Tables<"course_instances"> | null> {
        const { data } = await supabase
            .from('course_instances')
            .delete()
            .eq('id', id)
            .select()
            .maybeSingle()
            .throwOnError();

        await activityLogService.logActivity({
            action_type: 'permanent_delete',
            title: `Course deleted: ${data?.display_name ?? 'Unknown'}`,
            entity_type: 'course',
            entity_id: id,
        });

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
            .in('course_id', courseIds)
            .eq('status', 'enrolled');

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