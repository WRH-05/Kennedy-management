import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

import { createClient } from "@/lib/supabase/client"
import { activityLogService } from "@/services/activityLogService"

const supabase = createClient();

export type AssociatedGradeLevelsCourses = Tables<"course_eligibility"> & {
    courses: Tables<"courses">,
    grade_levels: Tables<"grade_levels">
}

export const gradeLevelsService = {
    async getAllGradeLevels(
        page = 1,
        pageSize = 0
    ): Promise<{ data: Tables<"grade_levels">[]; total: number; page: number; pageSize: number }> {
        let query = supabase
            .from('grade_levels')
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

    async getAllGradeLevelsByName(
        name: string,
        page = 1,
        pageSize = 0
    ): Promise<{ data: Tables<"grade_levels">[]; total: number; page: number; pageSize: number }> {
        let query = supabase
            .from('grade_levels')
            .select('*', { count: 'exact' })
            .ilike('name', `%${name}%`)
            .order('created_at', { ascending: false });

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }

        const { data, count } = await query.throwOnError();
        const finalData = data || [];

        return {
            data: finalData,
            total: count ?? finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };
    },


    async getGradeLevelById(id: string): Promise<Tables<"grade_levels">> {

        const { data } = await supabase
            .from('grade_levels')
            .select('*')
            .eq('id', id)
            .single()
            .throwOnError()

        return data
    },

    async addGradeLevel(studentData: TablesInsert<"grade_levels">): Promise<Tables<"grade_levels">> {
        const { data } = await supabase
            .from('grade_levels')
            .insert([studentData])
            .select()
            .single()
            .throwOnError()

        return data
    },

    async updateGradeLevel(id: string, updatedData: TablesUpdate<"grade_levels">): Promise<Tables<"grade_levels">> {
        const { data } = await supabase
            .from('grade_levels')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single()
            .throwOnError()

        return data
    },

    async deleteGradeLevel(id: string): Promise<{ success: boolean; error?: string }> {
        // Check for students assigned to this grade level before deleting
        const { data: assignedStudents } = await supabase
            .from('students')
            .select('id')
            .or(`school_level.eq.${id},extracurricular_grade_level_ids.cs.{${id}}`)

        if (assignedStudents && assignedStudents.length > 0) {
            return { success: false, error: "Cannot delete grade level: Students are currently assigned to this grade level." }
        }

        // Check for course eligibilities referencing this grade level
        const { data: linkedEligibilities } = await supabase
            .from('course_eligibility')
            .select('id')
            .eq('grade_level_id', id)

        if (linkedEligibilities && linkedEligibilities.length > 0) {
            return { success: false, error: "Cannot delete grade level: This grade level is assigned to one or more courses." }
        }

        const { data, error } = await supabase
            .from('grade_levels')
            .delete()
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        await activityLogService.logActivity({
            action_type: 'grade_level_delete',
            title: `Grade level deleted: ${data?.name ?? 'Unknown'}`,
            entity_type: 'grade_level',
            entity_id: id,
        })

        return { success: true }
    },
}