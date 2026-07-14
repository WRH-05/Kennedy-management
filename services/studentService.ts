import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

export type EnrichedStudent = Tables<"students"> & {
  grade_levels: Tables<"grade_levels">
}

export type StudentsResponse = Awaited<
  ReturnType<typeof studentService.getAllStudents>
>

export type Student = StudentsResponse['data'][number]

export const studentService = {
  async getAllStudents(
    page = 1,
    pageSize = 0,
    includeArchived = false
  ) {
    let query = supabase
      .from('students')
      .select('*, grade_levels(*), course_enrollments(*, course_instances(*)), student_payments(*, course_instances(*))', { count: pageSize > 0 ? 'exact' : 'estimated' });

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

    const finalData = data || [];


    return {
      data: finalData,
      total: pageSize > 0 ? (count ?? 0) : finalData.length,
      page,
      pageSize: pageSize > 0 ? pageSize : finalData.length,
    };
  },

  async getStudentById(id: string): Promise<EnrichedStudent> {

    const { data } = await supabase
      .from('students')
      .select('*, grade_levels(*)')
      .eq('id', id)
      .single()
      .throwOnError()

    return data
  },

  async addStudent(studentData: TablesInsert<"students">): Promise<Tables<"students">> {
    const { data } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single()
      .throwOnError()

    return data
  },

  async updateStudent(id: string, updatedData: TablesUpdate<"students">): Promise<EnrichedStudent> {
    console.log(updatedData)
    const { data } = await supabase
      .from('students')
      .update(updatedData)
      .eq('id', id)
      .select('*, grade_levels(*)')
      .single()
      .throwOnError()

    return data
  },

  async deleteStudent(id: string): Promise<Tables<"students">> {
    const { data } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .select()
      .single()
      .throwOnError()

    return data
  },

  async archiveStudent(id: string): Promise<Tables<"students">> {
    const { data } = await supabase
      .from('students')
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

  async unarchiveStudent(id: string): Promise<Tables<"students">> {
    const { data } = await supabase
      .from('students')
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