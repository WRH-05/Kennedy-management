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

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export function minutesUntilNextSession(schedules: Tables<"course_schedule">[], now: Date = new Date()): number {
  if (!schedules || schedules.length === 0) return Number.POSITIVE_INFINITY

  const nowDay = now.getDay()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const nowAbs = nowDay * 1440 + nowMinutes

  let best = Number.POSITIVE_INFINITY
  for (const s of schedules) {
    const dayIdx = DAY_INDEX[s.day]
    if (dayIdx === undefined) continue
    const [h, m] = (s.start_time || "00:00").slice(0, 5).split(":").map(Number)
    const slotMinutes = (h || 0) * 60 + (m || 0)
    const slotAbs = dayIdx * 1440 + slotMinutes
    let delta = slotAbs - nowAbs
    if (delta < 0) delta += 7 * 1440
    if (delta < best) best = delta
  }
  return best
}

// Expand a weekly course_schedule into concrete "YYYY-MM-DD" session dates
// within [startDate, endDate] inclusive, sorted ascending.
export function getSessionDates(
  schedules: Tables<"course_schedule">[],
  startDate: string,
  endDate: string
): string[] {
  if (!schedules || schedules.length === 0) return []
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return []

  const targetDays = new Set<number>()
  for (const s of schedules) {
    const dayIdx = DAY_INDEX[s.day]
    if (dayIdx !== undefined) targetDays.add(dayIdx)
  }
  if (targetDays.size === 0) return []

  const dates: string[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    if (targetDays.has(cursor.getDay())) {
      const y = cursor.getFullYear()
      const m = String(cursor.getMonth() + 1).padStart(2, "0")
      const d = String(cursor.getDate()).padStart(2, "0")
      dates.push(`${y}-${m}-${d}`)
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

// Pro-rate a full-period price to the remaining sessions, rounded to nearest 50 DA.
export function proRateTuition(
  fullPrice: number,
  totalSessions: number,
  remainingSessions: number
): number {
  if (!totalSessions || totalSessions <= 0) return fullPrice
  const raw = (fullPrice * remainingSessions) / totalSessions
  return Math.round(raw / 50) * 50
}

// Return the Monday of the week containing `date`, with time zeroed.
export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Mon=0 ... Sun=6
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
