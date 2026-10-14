import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface TimetableSchedule {
  id: string
  day: string
  start_time: string
  end_time: string
}

export interface TimetableInstance {
  id: string
  display_name: string | null
  teacher_id: string
  grade_level_ids: string[]
  course_eligibility_id: string
  teachers?: { name: string } | null
  course_eligibility?: {
    id: string
    grade_level_id: string | null
    courses?: { id: string; name: string } | null
    grade_levels?: { id: string; name: string } | null
  } | null
  course_schedule?: TimetableSchedule[]
  billing_periods?: { id: string; start_date: string; end_date: string }[]
}

export const timetableService = {
  async getTimetable(): Promise<TimetableInstance[]> {
    const { data } = await supabase
      .from('course_instances')
      .select('*, billing_periods(id, start_date, end_date), course_schedule(*), teachers(name), course_eligibility(id, grade_level_id, courses(id, name), grade_levels(id, name))')
      .eq('archived', false)
      .throwOnError()

    return (data || []) as TimetableInstance[]
  },
}
