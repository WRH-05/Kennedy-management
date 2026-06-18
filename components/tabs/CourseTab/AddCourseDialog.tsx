"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { ScheduleSlotRow } from "./ScheduleSlotRow"
import { courseService } from "@/services/courseService"
import { useToast } from "@/hooks/use-toast"
import { useTeachers } from "@/hooks/useTeachers"

interface ScheduleSlot {
  dayOfWeek: string
  startHour: string
  duration: number
}

interface AddCourseDialogProps {
  onCourseAdded: (updatedCourses: any[]) => void
}

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function AddCourseDialog({ onCourseAdded }: AddCourseDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPrivateStudents, setSelectedPrivateStudents] = useState<string[]>([])
  const [newCourse, setNewCourse] = useState({
    teacherId: "",
    teacherName: "",
    subject: "",
    schoolYear: "",
    percentageCut: 50,
    courseType: "Group",
    price: 500,
  })

  const { teachers: allTeachers, isLoading: loading } = useTeachers()
  const teachers = useMemo(() => {
    const list = Array.isArray(allTeachers) ? allTeachers : allTeachers?.data;
    return list;
  }, [allTeachers]);

  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([
    { dayOfWeek: "", startHour: "09:00", duration: 2 },
  ])

  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [showTeacherResults, setShowTeacherResults] = useState(false)
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([])

  useEffect(() => {
    if (teacherSearchQuery.trim()) {
      const filtered = teachers.filter((t) =>
        t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase())
      )
      setFilteredTeachers(filtered)
      setShowTeacherResults(true)
    } else {
      setFilteredTeachers([])
      setShowTeacherResults(false)
    }
  }, [teacherSearchQuery, teachers])

  const handleUpdateSlot = (index: number, fields: Partial<ScheduleSlot>) => {
    setScheduleSlots(scheduleSlots.map((slot, i) => (i === index ? { ...slot, ...fields } : slot)))
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (scheduleSlots.some((slot) => !slot.dayOfWeek)) {
      toast({
        title: "Validation Error",
        description: "Please specify the day of the week for all time slots",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const teacher = teachers.find((t) => t.id.toString() === newCourse.teacherId)
      if (!teacher) {
        toast({ title: "Error", description: "Selected teacher not found", variant: "destructive" })
        setIsSubmitting(false)
        return
      }

      const coursePayload = {
        teacher_id: teacher.id,
        subject: newCourse.subject,
        school_year: newCourse.schoolYear,
        percentage_cut: newCourse.percentageCut,
        course_type: newCourse.courseType,
        price: newCourse.price,
        monthly_price: newCourse.price,
        status: "active",
      }

      await courseService.addCourseInstance(coursePayload, scheduleSlots)
      const updatedCourses = await courseService.getAllCourseInstances()
      onCourseAdded(updatedCourses.data)

      // Reset
      setNewCourse({
        teacherId: "",
        teacherName: "",
        subject: "",
        schoolYear: "",
        percentageCut: 50,
        courseType: "Group",
        price: 500,
      })
      setScheduleSlots([{ dayOfWeek: "", startHour: "09:00", duration: 2 }])
      setSelectedPrivateStudents([])
      setTeacherSearchQuery("")
      setIsOpen(false)

      toast({
        title: "Course added",
        description: `${coursePayload.subject} has been successfully added.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add course: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTeacherData = teachers.find((t) => t.id.toString() === newCourse.teacherId)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddCourse} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Teacher Search */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="teacherSearch">Teacher</Label>
              <div className="relative">
                <Input
                  id="teacherSearch"
                  placeholder="Search for a teacher..."
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  required
                />
                {showTeacherResults && filteredTeachers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    {filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setNewCourse({
                            ...newCourse,
                            teacherId: teacher.id.toString(),
                            teacherName: teacher.name,
                          })
                          setTeacherSearchQuery(teacher.name)
                          setShowTeacherResults(false)
                        }}
                      >
                        <div className="font-medium">{teacher.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {newCourse.teacherId && (
              <>
                {/* Subject Selector */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={newCourse.subject}
                    onValueChange={(val) => setNewCourse({ ...newCourse, subject: val })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTeacherData?.subjects?.map((subject: string) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* School Year Selector */}
                <div className="space-y-2">
                  <Label htmlFor="schoolYear">School Year</Label>
                  <Select
                    value={newCourse.schoolYear}
                    onValueChange={(val) => setNewCourse({ ...newCourse, schoolYear: val })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school year" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTeacherData?.school_years?.map((year: string) => (
                        <SelectItem key={year.trim()} value={year.trim()}>
                          {year.trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="percentageCut">Percentage Cut (40-70%)</Label>
              <Input
                id="percentageCut"
                type="number"
                min="40"
                max="70"
                value={newCourse.percentageCut}
                onChange={(e) => setNewCourse({ ...newCourse, percentageCut: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseType">Course Type</Label>
              <Select
                value={newCourse.courseType}
                onValueChange={(val) => {
                  setNewCourse({ ...newCourse, courseType: val })
                  if (val !== "Private") setSelectedPrivateStudents([])
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Group">Group</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* Dynamic Multi-Schedule Sub-Section */}
            <div className="space-y-3 md:col-span-2 border border-slate-100 p-4 rounded-lg bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-semibold text-slate-800">Course Schedule Slots</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleSlots([...scheduleSlots, { dayOfWeek: "", startHour: "09:00", duration: 2 }])}
                  className="h-8 bg-white"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Slot
                </Button>
              </div>

              {scheduleSlots.map((slot, idx) => (
                <ScheduleSlotRow
                  key={idx}
                  slot={slot}
                  index={idx}
                  daysOfWeek={DAYS_OF_WEEK}
                  isRemovable={scheduleSlots.length > 1}
                  onUpdate={handleUpdateSlot}
                  onRemove={(index) => setScheduleSlots(scheduleSlots.filter((_, i) => i !== index))}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}