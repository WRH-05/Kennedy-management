import { createClient } from "@/lib/supabase/client"

const supabase = createClient();
import { Tables } from "@/types/database.types"


export type EnrichedCourseEnrollements = Tables<"course_enrollments"> & {students?: Tables<"students">}

export const courseEnrollmentService = {
  async getAllStudentsEnrolledInACourse(
    course_id: string,
    page = 1,
    pageSize = 0,
  ): Promise<{ data: EnrichedCourseEnrollements[]; total: number; page: number; pageSize: number }> {

    let query = supabase
      .from('course_enrollments')
      .select('*, students!inner(*)', { count: pageSize > 0 ? 'exact' : 'estimated' })
      .eq('course_id', course_id)
      .eq('status', 'enrolled')

    query = query.order('enrolled_at', { ascending: false });

    if (pageSize > 0) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, count } = await query.throwOnError();


    return {
      data,
      total: pageSize > 0 ? (count ?? 0) : data.length,
      page,
      pageSize: pageSize > 0 ? pageSize : data.length,
    };
  },
}