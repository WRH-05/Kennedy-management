import { supabase } from "@/lib/supabase"

export const studentService = {
  // Get all students (excluding archived unless specified)
  async getAllStudents(includeArchived = false) {
    try {
      let query = supabase.from('students').select('*')

      if (!includeArchived) {
        query = query.eq('archived', false)
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
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Update student
  async updateStudent(id, updatedData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Delete student
  async deleteStudent(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Archive student
  async archiveStudent(id) {
    try {
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
    } catch (error) {
      // Error handled
      throw error
    }
  },

  // Unarchive student
  async unarchiveStudent(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          archived: false,
          archived_date: null
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      // Error handled
      throw error
    }
  },
}