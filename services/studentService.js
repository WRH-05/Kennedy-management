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
  async getAllStudentsInCourseForBill(courseId, page = 1, pageSize = 0, includeArchived = false) {
    try {
      // 1. Target the junction table linking courses and students (Image 2)
      // We fetch the student data through the relationship join
      let query = supabase
        .from('course_enrollments') // Replace with your actual junction table name if different
        .select('*, students(*)', { count: pageSize ? 'exact' : null })
        .eq('course_id', courseId);

      // 2. Handle archiving logic based on the Course table (Image 1)
      // Note: If 'archived' lives on the 'students' table instead, change this to 'students.archived'
      if (!includeArchived) {
        query = query.eq('students.archived', false);
      }

      // 3. Apply pagination if pageSize is greater than 0
      if (pageSize > 0) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
          .order('enrolled_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        // Extract and map the nested student objects cleanly
        const students = data ? data.map(item => item.students).filter(Boolean) : [];

        return {
          data: students,
          total: count ?? 0,
          page,
          pageSize,
        };
      }

      // 4. Fallback execution for unpaginated requests
      const { data, error } = await query.order('enrolled_at', { ascending: false });

      if (error) throw error;

      return data ? data.map(item => item.students).filter(Boolean) : [];

    } catch (error) {
      console.error("Error fetching students for billing:", error);
      throw error;
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

  /**
 * Query students filtered by enrollment date directly from Supabase
 * @param {string} courseId 
 * @param {string} billingPeriodStartDate - e.g., '2026-06-01'
 */
  async getEnrolledStudentsPostBilling(courseId, billingPeriodStartDate) {
    const { data, error } = await supabase
      .from('students')
      .select(`
            *,
            course_enrollments!inner(course_id, enrolled_at)
        `)
      .eq('archived', false)
      .eq('course_enrollments.course_id', courseId)
      .gt('course_enrollments.enrolled_at', billingPeriodStartDate); // 'gt' stands for Greater Than

    if (error) throw error;
    return data || [];
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