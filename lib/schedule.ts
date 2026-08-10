import { Tables } from "@/types/database.types"

export function formatScheduleString(schedules: Tables<"course_schedule">[]): string {
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

export function mapSchedulesToSlots(schedules: Tables<"course_schedule">[]) {
  if (!schedules) return []
  return schedules.map((s) => {
    const startStr = s.start_time?.slice(0, 5) || "09:00"
    const endStr = s.end_time?.slice(0, 5) || "11:00"

    const [sH, sM] = startStr.split(":").map(Number)
    const [eH, eM] = endStr.split(":").map(Number)
    const durationHours = (eH * 60 + eM - (sH * 60 + sM)) / 60

    return {
      day: s.day as "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday",
      start_time: startStr,
      duration: durationHours > 0 ? durationHours : 2,
    }
  })
}

export type ScheduleSlot = {
  day: "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"
  start_time: string
  duration: number
}

export function calculateEndTime(startTime: string, durationHours: number): string {
  if (!startTime) return "00:00"
  const [hours, minutes] = startTime.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes + Math.round(durationHours * 60)
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`
}

export const VALID_WEEK_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

export function isValidWeekDay(day: string): boolean {
  return VALID_WEEK_DAYS.includes(day as any)
}
