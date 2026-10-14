import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

import { createClient } from "@/lib/supabase/client"
import { activityLogService } from "@/services/activityLogService"

const supabase = createClient();

export type EnrichedStudent = Tables<"students"> & {
  grade_levels: Tables<"grade_levels">
}

export type StudentsResponse = Awaited<
  ReturnType<typeof studentService.getAllStudents>
>

export type Student = StudentsResponse['data'][number]

const studentQuery = '*, grade_levels(*), course_enrollments(*, course_instances(*, teachers(*), course_eligibility(id, courses(*), grade_levels(*)), course_schedule(*))), student_payments(*, course_instances(*))'

export const studentService = {
  async getAllStudents(
    page = 1,
    pageSize = 0,
    includeArchived = false
  ) {
    let query = supabase
      .from('students')
      .select(studentQuery, { count: pageSize > 0 ? 'exact' : 'estimated' });

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

  async getStudentById(id: string) {

    const { data } = await supabase
      .from('students')
      .select(studentQuery)
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

    await activityLogService.logActivity({
      action_type: 'student_registration',
      title: `Student Registered: ${data.name}`,
      entity_type: 'student',
      entity_id: data.id,
    })

    return data
  },

  async updateStudent(id: string, updatedData: TablesUpdate<"students">) {
    const cleanedData = {
      address: updatedData.address,
      archived: updatedData.archived,
      birth_date: updatedData.birth_date,
      email: updatedData.email,
      name: updatedData.name,
      parent_phone: updatedData.parent_phone,
      phone: updatedData.phone,
      registration_fee_paid: updatedData.registration_fee_paid,
      school: updatedData.school,
      school_name: updatedData.school_name,
      school_level: updatedData.school_level,
      extracurricular_grade_level_ids: updatedData.extracurricular_grade_level_ids,
    }
    const { data } = await supabase
      .from('students')
      .update(cleanedData)
      .eq('id', id)
      .select(studentQuery)
      .single()
      .throwOnError()

    return data
  },

  /**
   * Permanently delete a student profile, for cleaning up accidental duplicates.
   *
   * Refuses when any payment was actually recorded, so money trails are never destroyed.
   * Otherwise clears the student's outstanding payments and enrollments first, then the
   * profile itself (enrollment/payment rows would cascade anyway, but deleting them
   * explicitly keeps the operation readable and works regardless of FK rules).
   */
  async deleteStudent(id: string): Promise<Tables<"students"> | null> {
    const { data: paidRows } = await supabase
      .from('student_payments')
      .select('id')
      .eq('student_id', id)
      .eq('status', 'paid')
      .throwOnError()

    if ((paidRows || []).length > 0) {
      throw new Error('Cannot delete student: Student has recorded paid payments. Archive the student instead.')
    }

    await supabase
      .from('student_payments')
      .delete()
      .eq('student_id', id)
      .neq('status', 'paid')
      .throwOnError()

    await supabase
      .from('course_enrollments')
      .delete()
      .eq('student_id', id)
      .throwOnError()

    const { data } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle()
      .throwOnError()

    await activityLogService.logActivity({
      action_type: 'permanent_delete',
      title: `Student deleted: ${data?.name ?? 'Unknown'}`,
      entity_type: 'student',
      entity_id: id,
    })

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