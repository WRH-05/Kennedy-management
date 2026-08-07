import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

// Define a type that extends the database types with the discriminator field
export type FoundPeople =
    | (Pick<Tables<'students'>, 'id' | 'name'> & { type: 'student' })
    | (Pick<Tables<'teachers'>, 'id' | 'name'> & { type: 'teacher' });

export async function searchAllCourseInstancesTeachersStudents(
    name: string,
    page = 1,
    pageSize = 0
) {
    // 1. Query Teachers
    let teacherQuery = supabase
        .from('teachers')
        .select('id, name', { count: pageSize > 0 ? 'exact' : 'estimated' });

    if (name && name.trim().length > 0) {
        const words = name.trim().split(/\s+/).filter(Boolean);
        words.forEach((word) => {
            teacherQuery = teacherQuery.or(`name.ilike.%${word}%`);
        });
    }

    if (pageSize > 0) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        teacherQuery = teacherQuery.range(from, to);
    }

    const { data: rawTeachers, count: teachersCount } = await teacherQuery.throwOnError();

    // 2. Query Students
    let studentsQuery = supabase
        .from('students')
        .select('id, name', { count: pageSize > 0 ? 'exact' : 'estimated' });

    if (name && name.trim().length > 0) {
        const words = name.trim().split(/\s+/).filter(Boolean);
        words.forEach((word) => {
            studentsQuery = studentsQuery.or(`name.ilike.%${word}%`);
        });
    }

    if (pageSize > 0) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        studentsQuery = studentsQuery.range(from, to);
    }

    const { data: rawStudents, count: studentsCount } = await studentsQuery.throwOnError();

    // 3. Map the type field and cast to FoundPeople[]
    const teachers: FoundPeople[] = (rawTeachers || []).map((t) => ({
        id: t.id,
        name: t.name,
        type: 'teacher' as const,
    }));

    const students: FoundPeople[] = (rawStudents || []).map((s) => ({
        id: s.id,
        name: s.name,
        type: 'student' as const,
    }));

    const count = (studentsCount || 0) + (teachersCount || 0);
    const finalData = students.concat(teachers);

    return {
        data: finalData,
        total: pageSize > 0 ? (count ?? 0) : finalData.length,
        page,
        pageSize: pageSize > 0 ? pageSize : finalData.length,
    };
}