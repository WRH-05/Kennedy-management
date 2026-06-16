// utils.ts
export function formatScheduleString(schedules: any[]): string {
  if (!schedules || schedules.length === 0) return "No scheduled slots"

  return schedules
    .map((s) => {
      const start = s.start_time?.slice(0, 5) || ""
      const end = s.end_time?.slice(0, 5) || ""
      const day = s.day ? s.day.charAt(0).toUpperCase() + s.day.slice(1) : ""
      return `${day} (${start} - ${end})`
    })
    .join(", ")
}

export function mapSchedulesToSlots(schedules: any[]): any[] {
  if (!schedules) return []
  return schedules.map(s => {
    const startStr = s.start_time?.slice(0, 5) || "09:00"
    const endStr = s.end_time?.slice(0, 5) || "11:00"

    const [sH, sM] = startStr.split(":").map(Number)
    const [eH, eM] = endStr.split(":").map(Number)
    const durationHours = (eH * 60 + eM - (sH * 60 + sM)) / 60

    return {
      dayOfWeek: s.day,
      startHour: startStr,
      duration: durationHours > 0 ? durationHours : 2
    }
  })
}