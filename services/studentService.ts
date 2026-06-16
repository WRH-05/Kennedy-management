import { supabase } from "@/lib/supabase"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { PostgrestError } from "@supabase/supabase-js"
export const studentService = {
  // Get all students (excluding archived unless specified)
  async getAllStudents(
    page = 1,
    pageSize = 0,
    includeArchived = false
  ): Promise<{ data: Tables<"students">[]; total: number; page: number; pageSize: number } | PostgrestError> {
    try {
      let query = supabase
        .from('students')
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

    } catch (error) {
      return error as PostgrestError;
    }
  },

  // Get student by ID
  async getStudentById(id: string): Promise<Tables<"students">[] | PostgrestError> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
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