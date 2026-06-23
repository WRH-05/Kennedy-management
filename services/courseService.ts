import { supabase } from "@/lib/supabase"
import { paymentService } from "./paymentService"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

export const courseService = {
    async getAllCourseInstances(
        page = 1,
        pageSize = 0,
        includeArchived = false
    ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {

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
        const { data, error } = await supabase
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
        const { data } = await supabase
            .from('course_enrollments')
            .select('course_id')
            .eq('student_id', studentId)
            .throwOnError()
            

        const courseIds = (data || []).map(e => e.course_id)
        if (courseIds.length === 0) return []

        const { data: courses } = await supabase
            .from('course_instances')
            .select('*, teachers(*)')
            .in('id', courseIds)
            .eq('archived', false)
            .order('created_at', { ascending: false })
            .throwOnError()

        return await this.enrichCoursesWithStudents(courses || [])
    },

    async getCourseEnrollments(courseId: string) {
        const { data } = await supabase
            .from('course_enrollments')
            .select('student_id, enrolled_at, status')
            .eq('course_id', courseId)
            .order('enrolled_at', { ascending: false })
            .throwOnError()

        return data || []
    },

    // Transaction
    async enrollStudent(courseId: string, studentId: string, firstBillingId: string) {
        const { data } = await supabase
            .from('course_enrollments')
            .insert([{ course_id: courseId, student_id: studentId }])
            .select()
            .single()
            .throwOnError()


        const { data: billings } = await supabase
            .from("billing_periods")
            .select()
            .eq("course_id", courseId)
            .order('start_date', { ascending: false })
            .throwOnError()


        const firstBilling = billings.find((b) => b.id === firstBillingId);

        if (!firstBilling) {
            throw new Error(`Billing period with ID ${firstBillingId} not found.`);
        }

        const filteredBillings = billings.filter((b) => b.start_date >= firstBilling.start_date);

        const paymentPromises = filteredBillings.map((fb) =>
            paymentService.recordStudentPayment(courseId, studentId, fb.id)
        );
        await Promise.all(paymentPromises);

        return data
    },

    async unenrollStudent(courseId: string, studentId: string) {
        const _ = await supabase
            .from('course_enrollments')
            .update({ status: 'dropped' })
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .throwOnError()

        return true
    },

    async getCourseSessions(courseId: string) {
        const { data } = await supabase
            .from('course_sessions')
            .select('*')
            .eq('course_id', courseId)
            .order('starts_at', { ascending: false })
            .throwOnError()

        return data || []
    },

    async createCourseSession(courseId: string, startsAt: Date, endsAt = null) {
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
        const { data: courseData, error: courseError } = await supabase
            .from('course_instances')
            .insert([{
                teacher_id: instanceData.teacher_id,
                subject: instanceData.subject,
                school_year: instanceData.school_year,
                percentage_cut: instanceData.percentage_cut,
                course_type: instanceData.course_type,
                price: instanceData.price,
                monthly_price: instanceData.monthly_price,
                status: instanceData.status
            }])
            .select()
            .single()

        if (courseError) throw courseError

        const schedulesToInsert = scheduleSlots.map(slot => {
            const [hours, minutes] = slot.startHour.split(":").map(Number)
            const totalMinutes = hours * 60 + minutes + (slot.duration * 60)
            const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0")
            const endMins = (totalMinutes % 60).toString().padStart(2, "0")
            const endHourString = `${endHours}:${endMins}`

            return {
                course_id: courseData.id,
                day: slot.dayOfWeek,
                start_time: `${slot.startHour}:00`,
                end_time: `${endHourString}:00`
            }
        })

        const { error: scheduleError } = await supabase
            .from('course_schedule')
            .insert(schedulesToInsert)

        if (scheduleError) {
            console.error("Schedule insertion failed, course created with ID:", courseData.id)
            throw scheduleError
        }

        return courseData
    },

    // Transaction
    async updateCourseInstance(id: string, updatedData: TablesUpdate<"course_instances">, scheduleSlots: any[]) {
        const { data } = await supabase
            .from('course_instances')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single()
            .throwOnError()

        if (scheduleSlots) {
            const { error: deleteError } = await supabase
                .from('course_schedule')
                .delete()
                .eq('course_id', id)

            if (deleteError) throw deleteError

            // Format and insert the new entries
            const schedulesToInsert = scheduleSlots.map(slot => {
                const [hours, minutes] = slot.startHour.split(":").map(Number)
                const totalMinutes = hours * 60 + minutes + (slot.duration * 60)
                const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0")
                const endMins = (totalMinutes % 60).toString().padStart(2, "0")
                const endHourString = `${endHours}:${endMins}`

                return {
                    course_id: id,
                    day: slot.dayOfWeek,
                    start_time: slot.startHour.includes(':00') ? slot.startHour : `${slot.startHour}:00`,
                    end_time: endHourString.includes(':00') ? endHourString : `${endHourString}:00`
                }
            })

            const { error: insertError } = await supabase
                .from('course_schedule')
                .insert(schedulesToInsert)

            if (insertError) throw insertError
        }

        return data
    },

    async archiveCourse(id: string) {
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

    async unarchiveCourse(id: string) {
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
