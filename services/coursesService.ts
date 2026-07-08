import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

export const coursesService = {
    async getAllCourses(
        page = 1,
        pageSize = 0
    ): Promise<{ data: Tables<"courses">[]; total: number; page: number; pageSize: number }> {
        let query = supabase
            .from('courses')
            .select('*', { count: pageSize > 0 ? 'exact' : 'estimated' });

        query = query.order('created_at', { ascending: false });


        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }


        const { data, count } = await query.throwOnError();

        const finalData = data || [];


        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };
    },

    async getCourseById(id: string): Promise<Tables<"courses">> {

        const { data } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single()
            .throwOnError()

        return data
    },

    async addCourse(studentData: TablesInsert<"courses">): Promise<Tables<"courses">> {
        const { data } = await supabase
            .from('courses')
            .insert([studentData])
            .select()
            .single()
            .throwOnError()

        return data
    },

    async updateCourse(id: number, updatedData: TablesUpdate<"courses">): Promise<Tables<"courses">> {
        const { data } = await supabase
            .from('courses')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single()
            .throwOnError()

        return data
    },

    async deleteCourse(id: number): Promise<Tables<"courses">> {
        const { data } = await supabase
            .from('courses')
            .delete()
            .eq('id', id)
            .select()
            .single()
            .throwOnError()

        return data
    },
}