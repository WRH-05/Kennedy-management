"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { ScheduleSlotRow } from "./ScheduleSlotRow"
import { courseInstancesService } from "@/services/courseInstancesService"
import { useToast } from "@/hooks/use-toast"
import { Database, TablesInsert } from "@/types/database.types"
import { Teacher, teacherService } from "@/services/teacherService"

interface ScheduleSlot {
  dayOfWeek: string
  startHour: string
  duration: number
}

interface AddCourseInstanceDialogProps {
  onCourseAdded: (updatedCourses: any[]) => void
}

const calculateEndHour = (startHour: string, duration: number) => {
  if (!startHour) return "--:--"
  const [hours, minutes] = startHour.split(":").map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + duration * 60
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
}

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function AddCourseDialog({ onCourseAdded }: AddCourseInstanceDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCourse, setNewCourse] = useState({
    teacherId: "",
    course_eligibility_id: "",
    percentageCut: 50,
    price: 500,
    compensationType: "percentage" as "percentage" | "fixed_salary",
    fixedSalaryAmount: 0,
    isIndividual: false,
  })

  const [displayName, setDisplayName] = useState("")

  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([
    { dayOfWeek: "", startHour: "09:00", duration: 2 },
  ])

  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [showTeacherResults, setShowTeacherResults] = useState(false)
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [selectedTeacherData, setSelectedTeacherData] = useState<Teacher>()

  useEffect(() => {
    if (teacherSearchQuery.trim()) {
      teacherService.searchAllTeachers(teacherSearchQuery)
        .then((response) => {
          setFilteredTeachers(response.data);
        })
        .catch((e) => {
          console.error('Teacher Search Error: ', e)
        })
      setShowTeacherResults(true)
    } else {
      setFilteredTeachers([])
      setShowTeacherResults(false)
    }
  }, [teacherSearchQuery])

  const handleUpdateSlot = (index: number, fields: Partial<ScheduleSlot>) => {
    setScheduleSlots(scheduleSlots.map((slot, i) => (i === index ? { ...slot, ...fields } : slot)))
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!newCourse.isIndividual && scheduleSlots.some((slot) => !slot.dayOfWeek)) {
      toast({
        title: "Validation Error",
        description: "Please specify the day of the week for all time slots",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (!selectedTeacherData) {
        toast({ title: "Error", description: "Selected teacher not found", variant: "destructive" })
        setIsSubmitting(false)
        return
      }

      const coursePayload = {
        teacher_id: selectedTeacherData.id,
        percentage_cut: newCourse.percentageCut,
        course_eligibility_id: newCourse.course_eligibility_id,
        price: newCourse.price,
        monthly_price: newCourse.price,
        display_name: displayName || null,
        compensation_type: newCourse.compensationType,
        fixed_salary_amount: newCourse.compensationType === 'fixed_salary' ? newCourse.fixedSalaryAmount : null,
        is_individual: newCourse.isIndividual,
        max_students: newCourse.isIndividual ? 2 : null,
      }
      const schedule: TablesInsert<"course_schedule">[] = scheduleSlots.map(s => {
        return {
          course_id: '',
          day: s.dayOfWeek as Database['public']['Enums']['week_day'],
          start_time: s.startHour,
          end_time: calculateEndHour(s.startHour, s.duration)
        }
      })
      await courseInstancesService.addCourseInstance(coursePayload, schedule)
      const updatedCourses = await courseInstancesService.getAllCourseInstances()
      onCourseAdded(updatedCourses.data)

      // Reset
      setNewCourse({
        teacherId: "",
        course_eligibility_id: '',
        percentageCut: 50,
        price: 500,
        compensationType: "percentage",
        fixedSalaryAmount: 0,
        isIndividual: false,
      })
      setScheduleSlots([{ dayOfWeek: "", startHour: "09:00", duration: 2 }])
      setTeacherSearchQuery("")
      setDisplayName("")
      setIsOpen(false)

      toast({
        title: "Course added",
        description: `Course Instance has been successfully added.`,
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
                  autoComplete="off"
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
                          })
                          setSelectedTeacherData(teacher)
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

            {selectedTeacherData && (
              <>
                {/* Subject Selector */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject & Grade</Label>
                  <Select
                    value={newCourse.course_eligibility_id}
                    onValueChange={(val) => {
                      setNewCourse({ ...newCourse, course_eligibility_id: val })
                      // Auto-fill display name from selected eligibility
                      const selected = selectedTeacherData.teachers_course_eligibility.find(
                        (tce) => tce.course_eligibility.id === val
                      )
                      if (selected) {
                        const autoName = selected.course_eligibility.courses.name +
                          (selected.course_eligibility.grade_levels?.name ? ' - ' + selected.course_eligibility.grade_levels.name : '')
                        setDisplayName(autoName)
                      }
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTeacherData.teachers_course_eligibility.map((tce) => (
                        <SelectItem key={tce.course_eligibility.id} value={tce.course_eligibility.id}>
                          {tce.course_eligibility.courses.name + ' ' + tce.course_eligibility.grade_levels?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Course Name - Grade Level"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="ciPrice">Price (DA)</Label>
              <Input
                id="ciPrice"
                type="number"
                value={newCourse.price}
                onChange={(e) => setNewCourse({ ...newCourse, price: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Compensation Type */}
            <div className="space-y-2">
              <Label htmlFor="compensationType">Teacher Compensation</Label>
              <Select
                value={newCourse.compensationType}
                onValueChange={(val) => setNewCourse({ ...newCourse, compensationType: val as "percentage" | "fixed_salary" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Cut</SelectItem>
                  <SelectItem value="fixed_salary">Fixed Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newCourse.compensationType === 'percentage' ? (
              <div className="space-y-2">
                <Label htmlFor="percentageCut">Percentage Cut (0-100%)</Label>
                <Input
                  id="percentageCut"
                  type="number"
                  min="0"
                  max="100"
                  value={newCourse.percentageCut}
                  onChange={(e) => setNewCourse({ ...newCourse, percentageCut: Number.parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="fixedSalary">Fixed Monthly Salary (DA)</Label>
                <Input
                  id="fixedSalary"
                  type="number"
                  value={newCourse.fixedSalaryAmount}
                  onChange={(e) => setNewCourse({ ...newCourse, fixedSalaryAmount: Number.parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            )}

            {/* Individual Course Toggle */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isIndividual"
                checked={newCourse.isIndividual}
                onCheckedChange={(checked) => setNewCourse({ ...newCourse, isIndividual: checked as boolean })}
              />
              <Label htmlFor="isIndividual">Individual Course / Private Lesson</Label>
            </div>
            {newCourse.isIndividual && (
              <p className="text-xs text-amber-600 -mt-1 ml-6">
                Max 2 students — schedule slots are optional
              </p>
            )}

            {/* Schedule Slots */}
            <div className="space-y-3 md:col-span-2 border border-slate-100 p-4 rounded-lg bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-semibold text-slate-800">
                  Course Schedule Slots {newCourse.isIndividual && "(Optional)"}
                </Label>
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