import { supabase } from "@/lib/supabase"

export const courseService = {
    // Get all course instances (excluding archived unless specified)
    async getAllCourseInstances(includeArchived = false) {
        try {

            let query = supabase.from('course_instances').select('*')

            if (!includeArchived) {
                query = query.eq('archived', false)
            }

            const { data, error } = await query.order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Get course instance by ID
    async getCourseInstanceById(id) {
        try {

            const { data, error } = await supabase
                .from('course_instances')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            throw error
        }
    },

    // Get courses by teacher ID
    async getCoursesByTeacherId(teacherId) {
        try {

            const { data, error } = await supabase
                .from('course_instances')
                .select('*')
                .eq('teacher_id', teacherId)
                .eq('archived', false)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Get courses by student ID
    async getCoursesByStudentId(studentId) {
        try {

            const { data, error } = await supabase
                .from('course_instances')
                .select('*')
                .contains('student_ids', [studentId])
                .eq('archived', false)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            // Error handled
            throw error
        }
    },

    // Add new course instance
    async addCourseInstance(instanceData) {
        try {

            const { data, error } = await supabase
                .from('course_instances')
                .insert([{ ...instanceData }])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            throw error
        }
    },

    // Update course instance
    async updateCourseInstance(id, updatedData) {
        try {

            const { data, error } = await supabase
                .from('course_instances')
                .update(updatedData)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            throw error
        }
    },

    // Archive course
    async archiveCourse(id) {
        try {

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
        } catch (error) {
            throw error
        }
    },

    // Unarchive course
    async unarchiveCourse(id) {
        try {

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
        } catch (error) {
            throw error
        }
    },
}
