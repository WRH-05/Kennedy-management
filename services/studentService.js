import { supabase } from "@/lib/supabase"

export const studentService = {
  // Get all students (excluding archived unless specified)
  async getAllStudents(page = 1, pageSize = 0, includeArchived = false) {
    try {
      const query = pageSize
        ? supabase.from('students').select('*', { count: 'exact' })
        : supabase.from('students').select('*')

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
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Get student by ID
  async getStudentById(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Add new student
  async addStudent(studentData) {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update student
  async updateStudent(id, updatedData) {
    const { data, error } = await supabase
      .from('students')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete student
  async deleteStudent(id) {
    const { data, error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Archive student
  async archiveStudent(id) {
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

  async unarchiveStudent(id) {
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