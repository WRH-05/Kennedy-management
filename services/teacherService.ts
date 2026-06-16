import { supabase } from "@/lib/supabase"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";
import { PostgrestError } from "@supabase/supabase-js";

export const teacherService = {
    async getAllTeachers(
        page = 1,
        pageSize = 0,
        includeArchived = false
    ): Promise<{ data: Tables<"teachers">[]; total: number; page: number; pageSize: number }> {

        let query = supabase
            .from('teachers')
            .select('*', { count: pageSize > 0 ? 'exact' : 'estimated' });

        if (!includeArchived) {
            query = query.eq('archived', false);
        }

        query = query.order('created_at', { ascending: false });

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        const finalData = data || [];

        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };

    },

    async getTeacherById(id: string): Promise<Tables<"teachers">> {
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async addTeacher(teacherData: TablesInsert<"teachers">): Promise<Tables<"teachers"> | PostgrestError> {
        const { data, error } = await supabase
            .from('teachers')
            .insert([{ ...teacherData }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateTeacher(id: string, updatedData: TablesUpdate<"teachers">): Promise<Tables<"teachers"> | PostgrestError> {
        const { data, error } = await supabase
            .from('teachers')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteTeacher(id: string): Promise<Tables<"teachers"> | PostgrestError> {
        const { data, error } = await supabase
            .from('teachers')
            .delete()
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async archiveTeacher(id: string): Promise<Tables<"teachers"> | PostgrestError> {
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

    async unarchiveTeacher(id: string): Promise<Tables<"teachers"> | PostgrestError> {
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
