import { supabase } from "@/lib/supabase"

export const teacherService = {
    // Get all teachers (excluding archived unless specified)
    async getAllTeachers(page = 1, pageSize = 0, includeArchived = false) {
        const query = pageSize
            ? supabase.from('teachers').select('*', { count: 'exact' })
            : supabase.from('teachers').select('*')

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

    // Get teacher by ID
    async getTeacherById(id) {
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    // Add new teacher
    async addTeacher(teacherData) {
        const { data, error } = await supabase
            .from('teachers')
            .insert([{ ...teacherData }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Update teacher
    async updateTeacher(id, updatedData) {
        const { data, error } = await supabase
            .from('teachers')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Delete teacher
    async deleteTeacher(id) {
        const { data, error } = await supabase
            .from('teachers')
            .delete()
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Archive teacher
    async archiveTeacher(id) {
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
    },

    // Unarchive teacher
    async unarchiveTeacher(id) {
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
    },
}
