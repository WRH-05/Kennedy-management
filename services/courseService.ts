import { supabase } from "@/lib/supabase"
import { studentService } from "./studentService"
import { paymentService } from "./paymentService"
import { Tables } from "@/types/database.types"

export const courseService = {
    // Get all course instances (excluding archived unless specified)
    async getAllCourseInstances(page = 1, pageSize = 0, includeArchived = false): Promise<Tables<"course_instances">[]> {
        const query = pageSize
            ? supabase.from('course_instances').select('*', { count: 'exact' })
            : supabase.from('course_instances').select('*')

        if (!includeArchived) {
            query.eq('archived', false)
        }

        let result
        if (pageSize > 0) {
            const from = (page - 1) * pageSize
            const to = from + pageSize - 1
            const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to)

            if (error) throw error

            // Enrich with student_ids
            const enrichedData = await this.enrichCoursesWithStudents(data || [])

            return {
                data: enrichedData,
                total: count ?? 0,
                page,
                pageSize,
            }
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error

        // Enrich with student_ids
        return await this.enrichCoursesWithStudents(data || [])
    },

    // Get course instance by ID
    async getCourseInstanceById(id) {
        const { data, error } = await supabase
            .from('course_instances')
            .select(`
            *,
            course_schedule (*)
        `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    // Get courses by teacher ID
    async getCoursesByTeacherId(teacherId) {
        const { data, error } = await supabase
            .from('course_instances')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('archived', false)
            .order('created_at', { ascending: false })

        if (error) throw error
        return await this.enrichCoursesWithStudents(data || [])
    },

    // Get courses by student ID
    async getCoursesByStudentId(studentId) {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select('course_id')
            .eq('student_id', studentId)

        if (error) throw error

        const courseIds = (data || []).map(e => e.course_id)
        if (courseIds.length === 0) return []

        const { data: courses, error: courseError } = await supabase
            .from('course_instances')
            .select('*')
            .in('id', courseIds)
            .eq('archived', false)
            .order('created_at', { ascending: false })

        if (courseError) throw courseError
        return await this.enrichCoursesWithStudents(courses || [])
    },

    // Get enrolled students for a course
    async getCourseEnrollments(courseId) {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select('student_id, enrolled_at')
            .eq('course_id', courseId)
            .order('enrolled_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Enroll student in course
    async enrollStudent(courseId, studentId, firstBillingId) {
        // 1. Insert the enrollment
        const { data, error } = await supabase
            .from('course_enrollments')
            .insert([{ course_id: courseId, student_id: studentId }])
            .select()
            .single()

        if (error) throw error

        // 2. Fetch billing periods
        const { data: billings, error: billingError } = await supabase
            .from("billing_periods")
            .select()
            .eq("course_id", courseId)
            .order('start_date', { ascending: false }) // Keep an eye on 'start_date' here

        if (billingError) throw billingError

        // 3. Find the starting billing period (Fixed: removed curly braces for implicit return)
        const firstBilling = billings.find((b) => b.id === firstBillingId);

        // Safety check: ensure the billing period actually exists
        if (!firstBilling) {
            throw new Error(`Billing period with ID ${firstBillingId} not found.`);
        }

        // 4. Filter future billings (Fixed: fixed return and changed start_time to start_date)
        const filteredBillings = billings.filter((b) => b.start_date >= firstBilling.start_date);

        // 5. Record payments (Fixed: changed .map to .forEach, added async/await handling)
        const paymentPromises = filteredBillings.map((fb) =>
            paymentService.recordStudentPayment(courseId, studentId, fb.id)
        );
        await Promise.all(paymentPromises);

        return data
    },

    // Unenroll student from course
    async unenrollStudent(courseId, studentId) {
        const { error } = await supabase
            .from('course_enrollments')
            .delete()
            .eq('course_id', courseId)
            .eq('student_id', studentId)

        if (error) throw error
        return true
    },

    // Get or create course sessions
    async getCourseSessions(courseId) {
        const { data, error } = await supabase
            .from('course_sessions')
            .select('*')
            .eq('course_id', courseId)
            .order('starts_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Create course session
    async createCourseSession(courseId, startsAt, endsAt = null) {
        const { data, error } = await supabase
            .from('course_sessions')
            .insert([{ course_id: courseId, starts_at: startsAt, ends_at: endsAt }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Add new course instance
    async addCourseInstance(instanceData, scheduleSlots) {
        // 1. Insert the course instance details first
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
                // Note: Remove the old 'schedule' or 'duration' fields if they are no longer in 'course_instances'
            }])
            .select()
            .single()

        if (courseError) throw courseError

        // 2. Map the frontend schedule slots to your Supabase table columns
        const schedulesToInsert = scheduleSlots.map(slot => {
            // Calculate the end hour format (HH:MM)
            const [hours, minutes] = slot.startHour.split(":").map(Number)
            const totalMinutes = hours * 60 + minutes + (slot.duration * 60)
            const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0")
            const endMins = (totalMinutes % 60).toString().padStart(2, "0")
            const endHourString = `${endHours}:${endMins}`

            return {
                course_id: courseData.id,          // Link it to the newly created course uuid
                day: slot.dayOfWeek,              // Matches 'day' (week_day custom enum or text)
                start_time: `${slot.startHour}:00`, // Matches 'start_time' time type (HH:MM:SS)
                end_time: `${endHourString}:00`    // Matches 'end_time' time type (HH:MM:SS)
            }
        })

        // 3. Bulk insert the schedules into your schedule table
        // Replace 'course_schedules' with your actual table name if it's named differently
        const { error: scheduleError } = await supabase
            .from('course_schedule')
            .insert(schedulesToInsert)

        if (scheduleError) {
            // Optional: If schedule insertion fails, you might want to delete the created course 
            // to keep data consistent (or handle it via database cascade / RPC)
            console.error("Schedule insertion failed, course created with ID:", courseData.id)
            throw scheduleError
        }

        return courseData
    },

    // Update course instance
    async updateCourseInstance(id, updatedData, scheduleSlots = null) {
        // 1. Update primary course fields
        const { data, error } = await supabase
            .from('course_instances')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // 2. If schedule slots are provided, handle updating the junction/related table
        if (scheduleSlots) {
            // First, purge existing schedules for this specific course instance
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

    // Archive course
    async archiveCourse(id) {
        const { data, error } = await supabase
            .from('course_instances')
            .update({
                archived: true,
                archived_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Unarchive course
    async unarchiveCourse(id) {
        const { data, error } = await supabase
            .from('course_instances')
            .update({
                archived: false,
                archived_date: null
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Helper: Get enrolled student IDs for a course (for backward compatibility)
    async getEnrolledStudentIds(courseId) {
        const enrollments = await this.getCourseEnrollments(courseId)
        return enrollments.map((e) => e.student_id)
    },

    // Helper: Enrich course data with student_ids for backward compatibility
    async enrichCourseWithStudents(courseData) {
        if (!courseData) return courseData

        const studentIds = await this.getEnrolledStudentIds(courseData.id)
        return {
            ...courseData,
            student_ids: studentIds
        }
    },

    // Helper: Enrich multiple courses with student IDs
    async enrichCoursesWithStudents(courses) {
        return Promise.all(
            courses.map(course => this.enrichCourseWithStudents(course))
        )
    }
}
