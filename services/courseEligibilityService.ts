import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

import { createClient } from "@/lib/supabase/client"
import { activityLogService } from "@/services/activityLogService"

const supabase = createClient();

export type AssociatedGradeLevelsCourses = Tables<"course_eligibility"> & {
    courses: Tables<"courses">,
    grade_levels: Tables<"grade_levels">
}

export const coursesEligiblityService = {
    async getAllCourseEligibilities(
        page = 1,
        pageSize = 0
    ) {
        let query = supabase
            .from('course_eligibility')
            .select('*, courses(*), grade_levels(*)', { count: pageSize > 0 ? 'exact' : 'estimated' });

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

    async searchAllCourseEligibilities(
        name: string,
        page = 1,
        pageSize = 0
    ) {
        let query = supabase
            .from('course_eligibility_search_view')
            .select('*', { count: pageSize > 0 ? 'exact' : 'estimated' });

        if (name && name.trim().length > 0) {
            const words = name.trim().split(/\s+/).filter(Boolean);

            words.forEach((word) => {
                query = query.or(`grade_level_name.ilike.%${word}%,course_name.ilike.%${word}%`);
            });
        }

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



    async getCourseEligibilityById(id: string) {

        const { data } = await supabase
            .from('course_eligibility')
            .select('*, courses(*), grade_levels(*)')
            .eq('id', id)
            .single()
            .throwOnError()

        return data
    },
    async getCourseEligibilityByCourseId(id: string) {

        const { data } = await supabase
            .from('course_eligibility')
            .select('*, courses(*), grade_levels(*)')
            .eq('course_id', id)
            .single()
            .throwOnError()

        return data
    },
    async getCourseEligibilityByGradeLevelId(id: string) {

        const { data } = await supabase
            .from('course_eligibility')
            .select('*, courses(*), grade_levels(*)')
            .eq('grade_level_id', id)
            .single()
            .throwOnError()

        return data
    },

    async getAllGradeLevelsByCourseId(
        courseId: string,
        page = 1,
        pageSize = 0
    ): Promise<{ data: AssociatedGradeLevelsCourses[]; total: number; page: number; pageSize: number }> {
        let query = supabase
            .from('course_eligibility')
            .select('id, courses(*), grade_levels(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })
            .eq('course_id', courseId);

        query = query.order('created_at', { ascending: false });

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }

        const { data, count } = await query.throwOnError();

        const finalData = (data || []) as unknown as AssociatedGradeLevelsCourses[];

        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };
    },

    async getAllCoursesByGradeLevelId(
        gradeLevelId: string,
        page = 1,
        pageSize = 0
    ): Promise<{ data: AssociatedGradeLevelsCourses[]; total: number; page: number; pageSize: number }> {
        let query = supabase
            .from('course_eligibility')
            .select('id, courses(*), grade_levels(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })
            .eq('grade_level_id', gradeLevelId);

        query = query.order('created_at', { ascending: false });

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }

        const { data, count } = await query.throwOnError();

        const finalData = (data || []) as unknown as AssociatedGradeLevelsCourses[];

        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };
    },

    async addCourseEligibility(courseEligibilityData: TablesInsert<"course_eligibility">) {
        const { data } = await supabase
            .from('course_eligibility')
            .insert([courseEligibilityData])
            .select('*, courses(*), grade_levels(*)')
            .single()
            .throwOnError()

        return data
    },

    async updateCourseEligibility(id: string, updatedData: TablesUpdate<"course_eligibility">) {
        const { data } = await supabase
            .from('course_eligibility')
            .update(updatedData)
            .eq('id', id)
            .select('*, courses(*), grade_levels(*)')
            .single()
            .throwOnError()

        return data
    },

    async deleteCourseEligibility(id: string): Promise<{ success: boolean; error?: string }> {
        // Check for class instances linked to this course eligibility before deleting
        const { data: instances } = await supabase
            .from('course_instances')
            .select('id')
            .eq('course_eligibility_id', id)

        if (instances && instances.length > 0) {
            return { success: false, error: "Cannot detach grade level: Active or historical class instances are currently linked to this course level." }
        }

        // Delete referencing teacher-assignment rows first to avoid a FK violation
        await supabase
            .from('teachers_course_eligibility')
            .delete()
            .eq('course_eligibility', id)

        const { data, error } = await supabase
            .from('course_eligibility')
            .delete()
            .eq('id', id)
            .select('*, courses(*), grade_levels(*)')
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        const deleted = data as any
        await activityLogService.logActivity({
            action_type: 'grade_level_delete',
            title: 'Grade level detached from course',
            description: `Detached grade level "${deleted.grade_levels?.name ?? 'Unknown'}" from course "${deleted.courses?.name ?? 'Unknown'}"`,
            entity_type: 'course_eligibility',
            entity_id: id,
        })

        return { success: true }
    },
}