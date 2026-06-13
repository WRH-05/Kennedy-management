import { supabase } from "@/lib/supabase"

export const teacherService = {
    // Get all teachers (excluding archived unless specified)
    async getAllTeachers(includeArchived = false) {
        try {
            let query = supabase.from('teachers').select('*')

            if (!includeArchived) {
                query = query.eq('archived', false)
            }

            const { data, error } = await query.order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            // Error handled
            throw error
        }
    },

    // Get teacher by ID
    async getTeacherById(id) {
        try {

            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            // Error handled
            throw error
        }
    },

    // Add new teacher
    async addTeacher(teacherData) {
        try {

            const { data, error } = await supabase
                .from('teachers')
                .insert([{ ...teacherData }])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            // Error handled
            throw error
        }
    },

    // Update teacher
    async updateTeacher(id, updatedData) {
        try {

            const { data, error } = await supabase
                .from('teachers')
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

    // Delete teacher
    async deleteTeacher(id) {
        try {

            const { data, error } = await supabase
                .from('teachers')
                .delete()
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            throw error
        }
    },

    // Archive teacher
    async archiveTeacher(id) {
        try {

            const { data, error } = await supabase
                .from('teachers')
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

    // Unarchive teacher
    async unarchiveTeacher(id) {
        try {

            const { data, error } = await supabase
                .from('teachers')
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
