import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

export type AssociatedGradeLevelsCourses = Tables<"course_eligibility"> & {
    courses: Tables<"courses">,
    grade_levels: Tables<"grade_levels">
}

export const coursesEligiblityService = {
    async getAllCourseEligibilities(
        page = 1,
        pageSize = 0
    ): Promise<{ data: AssociatedGradeLevelsCourses[]; total: number; page: number; pageSize: number }> {
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

    async getCourseEligibilityById(id: string): Promise<AssociatedGradeLevelsCourses> {

        const { data } = await supabase
            .from('course_eligibility')
            .select('*, courses(*), grade_levels(*)')
            .eq('id', id)
            .single()
            .throwOnError()

        return data
    },
    async getCourseEligibilityByCourseId(id: string): Promise<AssociatedGradeLevelsCourses> {

        const { data } = await supabase
            .from('course_eligibility')
            .select('*, courses(*), grade_levels(*)')
            .eq('course_id', id)
            .single()
            .throwOnError()

        return data
    },
    async getCourseEligibilityByGradeLevelId(id: string): Promise<AssociatedGradeLevelsCourses> {

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
            .select('courses(*), grade_levels(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })
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
            .select('courses(*), grade_levels(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })
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

    async addCourseEligibility(courseEligibilityData: TablesInsert<"course_eligibility">): Promise<AssociatedGradeLevelsCourses> {
        const { data } = await supabase
            .from('course_eligibility')
            .insert([courseEligibilityData])
            .select('*, courses(*), grade_levels(*)')
            .single()
            .throwOnError()

        return data
    },

    async updateCourseEligibility(id: string, updatedData: TablesUpdate<"course_eligibility">): Promise<AssociatedGradeLevelsCourses> {
        const { data } = await supabase
            .from('course_eligibility')
            .update(updatedData)
            .eq('id', id)
            .select('*, courses(*), grade_levels(*)')
            .single()
            .throwOnError()

        return data
    },

    async deleteCourseEligibility(id: string): Promise<AssociatedGradeLevelsCourses> {
        const { data } = await supabase
            .from('course_eligibility')
            .delete()
            .eq('id', id)
            .select('*, courses(*), grade_levels(*)')
            .single()
            .throwOnError()

        return data
    },
}