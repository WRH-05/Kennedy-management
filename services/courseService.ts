import { createClient } from "@/lib/supabase/client"

const supabase = createClient();
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

export const courseService = {
    async getAllCourseInstances(
        page = 1,
        pageSize = 0,
        includeArchived = false
    ): Promise<{ data: Tables<"course_instances">[]; total: number; page: number; pageSize: number }> {

        const query = supabase
            .from('course_instances')
            .select('*, teachers(*)', { count: 'exact' });

        if (!includeArchived) {
            query.eq('archived', false);
        }

        query.order('created_at', { ascending: false });

        // 4. Apply pagination conditionally
        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query.range(from, to);
        }

        const { data, count } = await query.throwOnError();

        const enrichedData = await this.enrichCoursesWithStudents(data || []);

        const totalCount = count !== null ? count : (data?.length || 0);

        return {
            data: enrichedData,
            total: totalCount,
            page,
            pageSize: pageSize > 0 ? pageSize : totalCount,
        };
    },

    async getCourseInstanceById(id: string): Promise<Tables<"course_instances">> {
        const { data } = await supabase
            .from('course_instances')
            .select(`
            *,
            course_schedule (*)
        `)
            .eq('id', id)
            .single()
            .throwOnError()

        return data
    },

    async getCoursesByTeacherId(teacherId: string): Promise<Tables<"course_instances">[]> {
        const { data } = await supabase
            .from('course_instances')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('archived', false)
            .order('created_at', { ascending: false })
            .throwOnError()

        return await this.enrichCoursesWithStudents(data || [])
    },

    async getCoursesByStudentId(studentId: string): Promise<Tables<"course_instances">[]> {
        const { data: enrollments, error } = await supabase
            .from('course_enrollments')
            .select(`course_id, course_instances!inner (*, teachers(*))`)
            .eq('student_id', studentId)
            .eq('course_instances.archived', false) // Filters out archived courses
            .order('course_instances(created_at)', { ascending: false })
            .throwOnError();

        const courses = (enrollments || []).map(e => e.course_instances);

        return await this.enrichCoursesWithStudents(courses || [])
    },

    async getCourseEnrollments(courseId: string): Promise<Tables<"course_enrollments">[]> {
        const { data } = await supabase
            .from('course_enrollments')
            .select('*')
            .eq('course_id', courseId)
            .order('enrolled_at', { ascending: false })
            .throwOnError()

        return data || []
    },

    // Transaction
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
        const _ = await supabase
            .from('course_enrollments')
            .update({ status: 'dropped' })
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .throwOnError()

        return true
    },

    async getCourseSessions(courseId: string): Promise<Tables<"course_sessions">[]> {
        const { data } = await supabase
            .from('course_sessions')
            .select('*')
            .eq('course_id', courseId)
            .order('starts_at', { ascending: false })
            .throwOnError()

        return data || []
    },

    async createCourseSession(courseId: string, startsAt: Date, endsAt = null): Promise<Tables<"course_sessions">> {
        const { data } = await supabase
            .from('course_sessions')
            .insert([{ course_id: courseId, starts_at: startsAt, ends_at: endsAt }])
            .select()
            .single()
            .throwOnError()

        return data
    },

    // Transaction
    async addCourseInstance(instanceData: TablesInsert<"course_instances">, scheduleSlots: any[]) {
        const schedulesToInsert = scheduleSlots.map(slot => {
            const [hours, minutes] = slot.startHour.split(":").map(Number);
            const totalMinutes = hours * 60 + minutes + (slot.duration * 60);
            const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
            const endMins = (totalMinutes % 60).toString().padStart(2, "0");
            const endHourString = `${endHours}:${endMins}`;

            return {
                day: slot.dayOfWeek,
                start_time: `${slot.startHour}:00`,
                end_time: `${endHourString}:00`
            };
        });

        // 2. Call the atomic RPC function
        const { data } = await supabase.rpc('add_course_instance_with_schedule', {
            p_instance: {
                teacher_id: instanceData.teacher_id,
                subject: instanceData.subject,
                school_year: instanceData.school_year,
                percentage_cut: instanceData.percentage_cut,
                course_type: instanceData.course_type,
                price: instanceData.price,
                monthly_price: instanceData.monthly_price,
                status: instanceData.status
            },
            p_schedules: schedulesToInsert
        })
            .throwOnError();

        return data;
    },

    async updateCourseInstance(id: string, updatedData: TablesUpdate<"course_instances">, scheduleSlots: any[]) {
        let schedulesToInsert: any[] | null = null;

        if (scheduleSlots) {
            schedulesToInsert = scheduleSlots.map(slot => {
                const [hours, minutes] = slot.startHour.split(":").map(Number);
                const totalMinutes = hours * 60 + minutes + (slot.duration * 60);
                const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
                const endMins = (totalMinutes % 60).toString().padStart(2, "0");
                const endHourString = `${endHours}:${endMins}`;

                return {
                    day: slot.dayOfWeek,
                    start_time: slot.startHour.includes(':00') ? slot.startHour : `${slot.startHour}:00`,
                    end_time: endHourString.includes(':00') ? endHourString : `${endHourString}:00`
                };
            });
        }

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
            .throwOnError()

        return data
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
            .throwOnError()

        return data
    },

    async getEnrolledStudentIds(courseId: string) {
        const enrollments = await this.getCourseEnrollments(courseId)
        return enrollments.map((e) => e.student_id)
    },

    async enrichCourseWithStudents(courseData: Tables<"course_instances">) {
        if (!courseData) return courseData

        const studentIds = await this.getEnrolledStudentIds(courseData.id)
        return {
            ...courseData,
            student_ids: studentIds
        }
    },

    async enrichCoursesWithStudents(courses: any[]) {
        return Promise.all(
            courses.map(course => this.enrichCourseWithStudents(course))
        )
    }
}
