import { createClient } from "@/lib/supabase/client"
import { formatScheduleString } from "@/lib/schedule"

const supabase = createClient();

export type FoundPeople =
    | { id: string; name: string; type: 'student' }
    | { id: string; name: string; type: 'teacher' }
    | { id: string; name: string; type: 'course-instance'; subtitle?: string };

export async function searchAllCourseInstancesTeachersStudents(
    name: string,
    page = 1,
    pageSize = 0
) {
    // Run all three queries in parallel
    const [teacherRes, studentRes, courseInstanceRes] = await Promise.all([
        searchTeachers(name, page, pageSize),
        searchStudents(name, page, pageSize),
        searchCourseInstances(name, page, pageSize),
    ])

    const allResults: FoundPeople[] = [
        ...teacherRes.data,
        ...studentRes.data,
        ...courseInstanceRes.data,
    ]

    const total = teacherRes.total + studentRes.total + courseInstanceRes.total

    return {
        data: allResults,
        total: pageSize > 0 ? total : allResults.length,
        page,
        pageSize: pageSize > 0 ? pageSize : allResults.length,
    }
}

async function searchTeachers(name: string, page: number, pageSize: number) {
    let query = supabase
        .from('teachers')
        .select('id, name', { count: pageSize > 0 ? 'exact' : 'estimated' })
        .eq('archived', false);

    if (name && name.trim().length > 0) {
        const words = name.trim().split(/\s+/).filter(Boolean);
        words.forEach((word) => {
            query = query.or(`name.ilike.%${word}%`);
        });
    }

    if (pageSize > 0) {
        const from = (page - 1) * pageSize;
        query = query.range(from, from + pageSize - 1);
    }

    const { data, count } = await query.throwOnError();

    return {
        data: (data || []).map((t): FoundPeople => ({ id: t.id, name: t.name, type: 'teacher' })),
        total: count || 0,
    }
}

async function searchStudents(name: string, page: number, pageSize: number) {
    let query = supabase
        .from('students')
        .select('id, name', { count: pageSize > 0 ? 'exact' : 'estimated' })
        .eq('archived', false);

    if (name && name.trim().length > 0) {
        const words = name.trim().split(/\s+/).filter(Boolean);
        words.forEach((word) => {
            query = query.or(`name.ilike.%${word}%`);
        });
    }

    if (pageSize > 0) {
        const from = (page - 1) * pageSize;
        query = query.range(from, from + pageSize - 1);
    }

    const { data, count } = await query.throwOnError();

    return {
        data: (data || []).map((s): FoundPeople => ({ id: s.id, name: s.name, type: 'student' })),
        total: count || 0,
    }
}

async function searchCourseInstances(name: string, page: number, pageSize: number) {
    if (!name || name.trim().length === 0) {
        return { data: [] as FoundPeople[], total: 0 }
    }

    let query = supabase
        .from('course_instances')
        .select('id, display_name, course_eligibility_id, course_eligibility!inner(courses!inner(name), grade_levels(name)), teachers(name), course_schedule(day, start_time, end_time)', { count: pageSize > 0 ? 'exact' : 'estimated' })
        .eq('archived', false)

    const words = name.trim().split(/\s+/).filter(Boolean);
    // Search by display_name first, fallback to composed name
    const filterStr = words.map((w) => `display_name.ilike.%${w}%`).join(',')
    query = query.or(filterStr)

    if (pageSize > 0) {
        const from = (page - 1) * pageSize;
        query = query.range(from, from + pageSize - 1);
    }

    const { data, count, error } = await query

    if (error) {
        console.error('Course instance search error:', error)
        return { data: [] as FoundPeople[], total: 0 }
    }

    return {
        data: (data || []).map((ci: any): FoundPeople => {
            const teacherName = ci.teachers?.name
            const scheduleStr = ci.course_schedule?.length
                ? formatScheduleString(ci.course_schedule)
                : ""
            const parts: string[] = []
            if (teacherName) parts.push(`Teacher: ${teacherName}`)
            if (scheduleStr) {
                parts.push(scheduleStr)
            } else {
                const gradeName = ci.course_eligibility?.grade_levels?.name
                if (gradeName) parts.push(gradeName)
            }
            return {
                id: ci.id,
                name: ci.display_name || `${ci.course_eligibility?.courses?.name || ''} - ${ci.course_eligibility?.grade_levels?.name || ''}`,
                type: 'course-instance',
                subtitle: parts.length ? parts.join(' • ') : undefined,
            }
        }),
        total: count || 0,
    }
}
