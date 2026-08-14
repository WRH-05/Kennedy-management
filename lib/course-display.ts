export function getCourseDisplayName(courseInstance: any): string {
  if (!courseInstance) return "—"
  if (courseInstance.display_name) return courseInstance.display_name
  const courseEligibility = courseInstance.course_eligibility
  const courseName = courseEligibility?.courses?.name || ""
  const gradeName = courseEligibility?.grade_levels?.name || ""
  if (courseName && gradeName) return `${courseName} - ${gradeName}`
  if (courseName) return courseName
  if (gradeName) return gradeName
  return "—"
}

export function formatCourseType(type: string): string {
  return type === "academic" ? "Academic" : "Extracurricular"
}
