import { supabase } from '@/lib/supabase'

export const attendanceService = {
    // Legacy method for backward compatibility - maps to session attendance
    // DEPRECATED: Use markSessionAttendance instead
    async updateAttendance(courseId, studentId, week, attended) {
        console.warn('updateAttendance is deprecated. Use markSessionAttendance with sessionId instead.')
        
        // Get or create a default session for this course and week
        const sessionLabel = `Week ${week}`
        const { data: sessions, error: sessionError } = await supabase
            .from('course_sessions')
            .select('id')
            .eq('course_id', courseId)
            .order('starts_at', { ascending: true })
            .limit(parseInt(week) || 1)

        if (sessionError) throw sessionError
        
        // Use the corresponding session if it exists
        const targetSession = sessions?.[parseInt(week) - 1 || 0]
        if (!targetSession) {
            throw new Error(`No session found for week ${week}`)
        }

        return this.markSessionAttendance(targetSession.id, studentId, attended ? 'present' : 'absent')
    },

    // Mark attendance for a student in a session
    async markSessionAttendance(sessionId, studentId, status = 'present', billingPeriodId = null) {
        // Check if attendance record exists
        const { data: existingRecord, error: fetchError } = await supabase
            .from('session_attendance')
            .select('*')
            .eq('session_id', sessionId)
            .eq('student_id', studentId)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

        if (existingRecord) {
            const { data, error } = await supabase
                .from('session_attendance')
                .update({ 
                    status,
                    marked_at: new Date().toISOString(),
                    ...(billingPeriodId && { billing_period_id: billingPeriodId })
                })
                .eq('session_id', sessionId)
                .eq('student_id', studentId)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            const { data, error } = await supabase
                .from('session_attendance')
                .insert([{
                    session_id: sessionId,
                    student_id: studentId,
                    status: status,
                    marked_at: new Date().toISOString(),
                    ...(billingPeriodId && { billing_period_id: billingPeriodId })
                }])
                .select()
                .single()

            if (error) throw error
            return data
        }
    },

    // Get attendance for a course session
    async getSessionAttendance(sessionId) {
        const { data, error } = await supabase
            .from('session_attendance')
            .select('*')
            .eq('session_id', sessionId)
            .order('marked_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get attendance for a student across all sessions
    async getStudentSessionAttendance(studentId, courseId = null) {
        let query = supabase
            .from('session_attendance')
            .select(`
                *,
                course_sessions (
                    course_id,
                    starts_at,
                    ends_at
                )
            `)
            .eq('student_id', studentId)

        if (courseId) {
            // Filter by course through the course_sessions relationship
            // This requires fetching sessions first then filtering
            const { data: sessions } = await supabase
                .from('course_sessions')
                .select('id')
                .eq('course_id', courseId)

            const sessionIds = (sessions || []).map(s => s.id)
            if (sessionIds.length > 0) {
                query = query.in('session_id', sessionIds)
            }
        }

        const { data, error } = await query.order('marked_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get attendance for a course across all students (legacy method)
    // Maps to session-based attendance for backward compatibility
    async getCourseAttendance(courseId) {
        const { data: sessions, error: sessionError } = await supabase
            .from('course_sessions')
            .select('id')
            .eq('course_id', courseId)

        if (sessionError) throw sessionError

        const sessionIds = (sessions || []).map(s => s.id)
        if (sessionIds.length === 0) return {}

        const { data, error } = await supabase
            .from('session_attendance')
            .select('*')
            .in('session_id', sessionIds)
            .order('marked_at', { ascending: false })

        if (error) throw error

        // Transform to expected format: { studentId: { week1: true, week2: false, ... } }
        const attendanceMap = {}
        data?.forEach((record, index) => {
            const week = Math.floor(index / (data.length / sessionIds.length)) + 1
            if (!attendanceMap[record.student_id]) {
                attendanceMap[record.student_id] = {}
            }
            attendanceMap[record.student_id][week] = record.status === 'present'
        })

        return attendanceMap
    },

    // Get attendance for a course across all students (new method)
    async getCourseAttendanceBySession(courseId) {
        const { data: sessions, error: sessionError } = await supabase
            .from('course_sessions')
            .select('id')
            .eq('course_id', courseId)

        if (sessionError) throw sessionError

        const sessionIds = (sessions || []).map(s => s.id)
        if (sessionIds.length === 0) return []

        const { data, error } = await supabase
            .from('session_attendance')
            .select('*')
            .in('session_id', sessionIds)
            .order('marked_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get attendance statistics for a billing period
    async getBillingPeriodAttendance(billingPeriodId, courseId = null) {
        let query = supabase
            .from('session_attendance')
            .select('*')
            .eq('billing_period_id', billingPeriodId)

        if (courseId) {
            // Filter by course through the course_sessions relationship
            const { data: sessions } = await supabase
                .from('course_sessions')
                .select('id')
                .eq('course_id', courseId)

            const sessionIds = (sessions || []).map(s => s.id)
            if (sessionIds.length > 0) {
                query = query.in('session_id', sessionIds)
            }
        }

        const { data, error } = await query.order('marked_at', { ascending: false })

        if (error) throw error
        return data || []
    },
}
