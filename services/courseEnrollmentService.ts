import { supabase } from "@/lib/supabase"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { PostgrestError } from "@supabase/supabase-js"

export const courseEnrollmentService = {
  // Get all students (excluding archived unless specified)
  async getAllStudentsEnrolledInACourse(
    course_id: string,
    page = 1,
    pageSize = 0,
  ): Promise<{ data: Tables<"students">[]; total: number; page: number; pageSize: number }> {

    // 1. Fixed: Filtering by course_id added. 
    // 2. Fixed: Inner join syntax 'students!inner(*)' ensures we can filter or handle joins cleanly.
    let query = supabase
      .from('course_enrollments')
      .select('students!inner(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })
      .eq('course_id', course_id);

    query = query.order('enrolled_at', { ascending: false });

    if (pageSize > 0) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;


    if (error) throw error;

    const finalData: Tables<"students">[] = (data || [])
      .map((enrollment) => {
        const student = enrollment.students as unknown as Tables<"students">;
        return student;
      })
      .filter(Boolean);
    return {
      data: finalData,
      total: pageSize > 0 ? (count ?? 0) : finalData.length,
      page,
      pageSize: pageSize > 0 ? pageSize : finalData.length,
    };
  },

  async getCourseEnrollmentByStudentId(student_id: string): Promise<Tables<"course_enrollments">[]> {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('*, course_instances (*)')
      .eq('student_id', student_id)
    if (error) throw error
    return data
  },

  async addStudent(studentData: TablesInsert<"students">): Promise<Tables<"students"> | PostgrestError> {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateStudent(id: string, updatedData: TablesUpdate<"students">): Promise<Tables<"students"> | PostgrestError> {
    const { data, error } = await supabase
      .from('students')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteStudent(id: string): Promise<Tables<"students"> | PostgrestError> {
    const { data, error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async archiveStudent(id: string): Promise<Tables<"students"> | PostgrestError> {
    const { data, error } = await supabase
      .from('students')
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

  //consider removing

  async unarchiveStudent(id: string): Promise<Tables<"students"> | PostgrestError> {
    const { data, error } = await supabase
      .from('students')
      .update({
        archived: false,
        archived_date: null
      })
      .eq('id', id)
      .select()
      .single()
    console.log(data)
    if (error) throw error
    return data
  },
}