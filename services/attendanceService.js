import { supabase } from '@/lib/supabase'
import { profileService } from './profileService'

export const attendanceService = {
    // Update attendance for student in course
    async updateAttendance(courseId, studentId, week, attended) {
        const profile = await profileService.getCurrentUserProfile()
        const schoolId = profile?.school_id
        if (!schoolId) throw new Error('No school access')

        // Check if attendance record exists
        const { data: existingRecord, error: fetchError } = await supabase
            .from('attendance')
            .select('*')
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .eq('school_id', schoolId)
            .eq('week', week)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

        if (existingRecord) {
            const { data, error } = await supabase
                .from('attendance')
                .update({ attended })
                .eq('id', existingRecord.id)
                .eq('school_id', schoolId)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            const { data, error } = await supabase
                .from('attendance')
                .insert([{
                    course_id: courseId,
                    student_id: studentId,
                    school_id: schoolId,
                    week,
                    attended
                }])
                .select()
                .single()

            if (error) throw error
            return data
        }
    },

    // Get attendance for course
    async getCourseAttendance(courseId) {
        const profile = await profileService.getCurrentUserProfile()
        const schoolId = profile?.school_id
        if (!schoolId) throw new Error('No school access')

        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('course_id', courseId)
            .eq('school_id', schoolId)

        if (error) throw error

        // Transform to expected format: { studentId: { week1: true, week2: false, ... } }
        const attendanceMap = {}
        data?.forEach(record => {
            if (!attendanceMap[record.student_id]) {
                attendanceMap[record.student_id] = {}
            }
            attendanceMap[record.student_id][record.week] = record.attended
        })

        return attendanceMap
    },
}
