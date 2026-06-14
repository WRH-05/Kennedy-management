import { supabase } from "@/lib/supabase"

export const courseService = {
    // Get all course instances (excluding archived unless specified)
    async getAllCourseInstances(page = 1, pageSize = 0, includeArchived = false) {
        const query = pageSize
            ? supabase.from('course_instances').select('*', { count: 'exact' })
            : supabase.from('course_instances').select('*')

        if (!includeArchived) {
            query.eq('archived', false)
        }

        if (pageSize > 0) {
            const from = (page - 1) * pageSize
            const to = from + pageSize - 1
            const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to)

            if (error) throw error
            return {
                data: data || [],
                total: count ?? 0,
                page,
                pageSize,
            }
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get course instance by ID
    async getCourseInstanceById(id) {
        const { data, error } = await supabase
            .from('course_instances')
            .select('*')
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
        return data || []
    },

    // Get courses by student ID
    async getCoursesByStudentId(studentId) {
        const { data, error } = await supabase
            .from('course_instances')
            .select('*')
            .contains('student_ids', [studentId])
            .eq('archived', false)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Add new course instance
    async addCourseInstance(instanceData) {

        const { data, error } = await supabase
            .from('course_instances')
            .insert([{ ...instanceData }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Update course instance
    async updateCourseInstance(id, updatedData) {
        const { data, error } = await supabase
            .from('course_instances')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
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
}
