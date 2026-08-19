"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, ChevronLeft, ChevronRight, CalendarDays, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTimetable } from "@/hooks/useTimetable"
import { usePaginatedGradeLevels } from "@/hooks/useGradeLevels"
import { usePaginatedCourses } from "@/hooks/useCourses"
import { VALID_WEEK_DAYS, startOfWeek, addDays } from "@/lib/schedule"
import { getCourseDisplayName } from "@/lib/course-display"
import { TimetableInstance } from "@/services/timetableService"

const ALL = "all"

function capitalizeDay(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

function formatSlot(start: string | undefined, end: string | undefined): string {
  const s = start?.slice(0, 5) || "?"
  const e = end?.slice(0, 5) || "?"
  return `${s} - ${e}`
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatWeekLabel(weekStart: Date, weekEnd: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
  return `Week of ${fmt(weekStart)} - ${fmt(weekEnd)} ${weekEnd.getFullYear()}`
}

interface ComboboxOption {
  value: string
  label: string
}

function Combobox({ options, value, onSelect, placeholder }: {
  options: ComboboxOption[]
  value: string
  onSelect: (value: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[220px] justify-between">
          {selected?.label ?? placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>No result found.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => { onSelect(o.value); setOpen(false) }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === o.value ? "opacity-100" : "opacity-0"}`} />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function TimetablePage() {
  const { instances, isLoading } = useTimetable()
  const { gradeLevels } = usePaginatedGradeLevels(1, 0)
  const { courses } = usePaginatedCourses(1, 0)

  const [gradeFilter, setGradeFilter] = useState<string>(ALL)
  const [courseFilter, setCourseFilter] = useState<string>(ALL)
  const [weekOffset, setWeekOffset] = useState<number>(0)

  const weekStart = useMemo(() => addDays(startOfWeek(new Date()), weekOffset * 7), [weekOffset])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])

  const gradeOptions: ComboboxOption[] = [
    { value: ALL, label: "All Grade Levels" },
    ...gradeLevels.map((g: any) => ({ value: g.id, label: g.name })),
  ]
  const courseOptions: ComboboxOption[] = [
    { value: ALL, label: "All Courses" },
    ...courses.map((c: any) => ({ value: c.id, label: c.name })),
  ]

  const filtered = useMemo(() => {
    const weekStartISO = toISODate(weekStart)
    const weekEndISO = toISODate(weekEnd)
    return (instances as TimetableInstance[]).filter((ci) => {
      if (gradeFilter !== ALL) {
        const inGrade = (ci.grade_level_ids || []).includes(gradeFilter)
          || ci.course_eligibility?.grade_level_id === gradeFilter
        if (!inGrade) return false
      }
      if (courseFilter !== ALL) {
        if (ci.course_eligibility?.courses?.id !== courseFilter) return false
      }
      const periods = ci.billing_periods || []
      if (periods.length > 0) {
        const overlaps = periods.some(
          (bp) => (bp.start_date || "") <= weekEndISO && (bp.end_date || "") >= weekStartISO
        )
        if (!overlaps) return false
      }
      return true
    })
  }, [instances, gradeFilter, courseFilter, weekStart, weekEnd])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((o) => o - 1)}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev Week
        </Button>
        <div className="min-w-[260px] text-center text-sm font-semibold text-slate-800">
          {formatWeekLabel(weekStart, weekEnd)}
        </div>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((o) => o + 1)}>
          Next Week
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl font-bold">School Timetable & Schedule</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Weekly timetable grid of all active class sessions.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Combobox options={gradeOptions} value={gradeFilter} onSelect={setGradeFilter} placeholder="All Grade Levels" />
                <Combobox options={courseOptions} value={courseFilter} onSelect={setCourseFilter} placeholder="All Courses" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 divide-x divide-slate-200">
              {VALID_WEEK_DAYS.map((day) => {
                const dayInstances = filtered
                  .map((ci) => {
                    const slots = (ci.course_schedule || [])
                      .filter((s) => s.day === day)
                      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
                    return { ci, slots }
                  })
                  .filter((x) => x.slots.length > 0)
                  .sort((a, b) => (a.slots[0].start_time || "").localeCompare(b.slots[0].start_time || ""))

                return (
                  <div key={day} className="flex flex-col min-h-[200px]">
                    <div className="bg-slate-100 p-3 text-center border-b font-bold text-sm text-slate-800">
                      {capitalizeDay(day)} ({dayInstances.length})
                    </div>
                    <div className="flex-1 space-y-2 p-2">
                      {dayInstances.length > 0 ? (
                        dayInstances.map(({ ci, slots }) => (
                          <div key={ci.id} className="bg-white border border-slate-200 border-l-4 border-l-primary p-2.5 rounded-md shadow-xs hover:shadow-md transition-all space-y-1.5">
                            <Link href={`/course-instance/${ci.id}`} className="block font-bold text-sm hover:underline">
                              {getCourseDisplayName(ci)}
                            </Link>
                            {slots.map((slot) => (
                              <span key={slot.id} className="inline-block bg-slate-100 text-slate-800 text-xs font-mono font-semibold px-2 py-0.5 rounded">
                                {formatSlot(slot.start_time, slot.end_time)}
                              </span>
                            ))}
                            <div className="text-xs text-muted-foreground">{ci.teachers?.name || "—"}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-muted-foreground">—</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-lg text-gray-400">
          <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active class sessions match the current filters.</p>
        </div>
      )}
    </div>
  )
}
