import { createClient } from "@/lib/supabase/client"

const supabase = createClient();
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";
import { PostgrestError } from "@supabase/supabase-js";


export type TeachersResponse = Awaited<
    ReturnType<typeof teacherService.getAllTeachers>
>;

export type Teacher = TeachersResponse["data"][number];

export const teacherService = {
    async getAllTeachers(
        page = 1,
        pageSize = 0,
        includeArchived = false
    ) {

        let query = supabase
            .from('teachers')
            .select('*, teachers_course_eligibility(course_eligibility(id, courses(*), grade_levels(*)))', { count: pageSize > 0 ? 'exact' : 'estimated' });


        if (!includeArchived) {
            query = query.eq('archived', false);
        }

        query = query.order('created_at', { ascending: false });

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }



        const { data, count } = await query.throwOnError();


        const finalData = data;

        return {
            data: finalData,
            total: pageSize > 0 ? (count ?? 0) : finalData.length,
            page,
            pageSize: pageSize > 0 ? pageSize : finalData.length,
        };

    },

    async getTeacherById(id: string) {
        const { data } = await supabase
            .from('teachers')
            .select('*, teachers_course_eligibility(id, course_eligibility(id, courses(*), grade_levels(*)))')
            .eq('id', id)
            .single()
            .throwOnError()

        return data
    },

    async addTeacher(teacherData: TablesInsert<"teachers">): Promise<Tables<"teachers">> {
        const { data } = await supabase
            .from('teachers')
            .insert([{ ...teacherData }])
            .select()
            .single()
            .throwOnError()

        return data
    },

    async addCourseEligibility(teacherId: string, courseEligibilityId: string) {
        const { data } = await supabase
            .from('teachers_course_eligibility')
            .insert({ course_eligibility: courseEligibilityId, teacher_id: teacherId })
            .select()
            .throwOnError()

        return data
    },

    async updateTeacher(id: string, updatedData: TablesUpdate<"teachers"> & { grade_level_ids: string[] }) {
        const { grade_level_ids, ...teacherProfileData } = updatedData;

        const { data } = await supabase.rpc('update_teacher_and_eligibility', {
            p_teacher_id: id,
            p_profile_data: teacherProfileData,
            p_grade_level_ids: grade_level_ids
        }).throwOnError();

        return data
    },


    async deleteTeacher(id: string): Promise<Tables<"teachers"> | PostgrestError> {
        const { data } = await supabase
            .from('teachers')
            .delete()
            .eq('id', id)
            .select()
            .single()
            .throwOnError()

        return data
    },

    async archiveTeacher(id: string): Promise<Tables<"teachers"> | PostgrestError> {
        const { data } = await supabase
            .from('teachers')
            .update({
                archived: true,
                archived_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()
            .throwOnError()

        return data
    },

    async unarchiveTeacher(id: string): Promise<Tables<"teachers"> | PostgrestError> {
        const { data } = await supabase
            .from('teachers')
            .update({
                archived: false,
                archived_date: null
            })
            .eq('id', id)
            .select()
            .single()
            .throwOnError()

        return data
    },
}
