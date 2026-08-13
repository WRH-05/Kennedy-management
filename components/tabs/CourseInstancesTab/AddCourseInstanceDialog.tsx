"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, X } from "lucide-react"
import { ScheduleSlotRow } from "./ScheduleSlotRow"
import { courseInstancesService } from "@/services/courseInstancesService"
import { useToast } from "@/hooks/use-toast"
import { Database, TablesInsert } from "@/types/database.types"
import { Teacher, teacherService } from "@/services/teacherService"
import { calculateEndTime, isValidWeekDay } from "@/lib/schedule"

interface ScheduleSlot {
  dayOfWeek: string
  startHour: string
  duration: number
}

interface AddCourseInstanceDialogProps {
  onCourseAdded: (updatedCourses: any[]) => void
}

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function AddCourseDialog({ onCourseAdded }: AddCourseInstanceDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCourse, setNewCourse] = useState({
    teacherId: "",
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

  const [availableCourses, setAvailableCourses] = useState<{ id: string; name: string }[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [eligibleGradeLevels, setEligibleGradeLevels] = useState<{ gradeLevelId: string; gradeLevelName: string; eligibilityId: string }[]>([])
  const [selectedGradeLevelIds, setSelectedGradeLevelIds] = useState<string[]>([])
  const [gradeSearchQuery, setGradeSearchQuery] = useState("")
  const [showGradeResults, setShowGradeResults] = useState(false)

  const handleTeacherSearch = (query: string) => {
    setTeacherSearchQuery(query)
    if (query.trim()) {
      teacherService.searchAllTeachers(query)
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
  }

  // Automatically generate the display name from the selected course + grade levels.
  useEffect(() => {
    if (!selectedCourseId) return
    const courseName = availableCourses.find((c) => c.id === selectedCourseId)?.name || ""
    const gradeNames = selectedGradeLevelIds
      .map((id) => eligibleGradeLevels.find((g) => g.gradeLevelId === id)?.gradeLevelName)
      .filter(Boolean)
    setDisplayName(gradeNames.length ? `${courseName} - ${gradeNames.join(", ")}` : courseName)
  }, [selectedCourseId, selectedGradeLevelIds, availableCourses, eligibleGradeLevels])

  const handleUpdateSlot = (index: number, fields: Partial<ScheduleSlot>) => {
    setScheduleSlots(scheduleSlots.map((slot, i) => (i === index ? { ...slot, ...fields } : slot)))
  }

  const handleTeacherSelect = (teacher: Teacher) => {
    setNewCourse({ ...newCourse, teacherId: teacher.id.toString() })
    setSelectedTeacherData(teacher)
    setTeacherSearchQuery(teacher.name)
    setShowTeacherResults(false)

    // Build distinct course templates from the teacher's eligible combos
    const courseMap = new Map<string, { id: string; name: string }>()
    teacher.teachers_course_eligibility?.forEach((tce) => {
      const c = tce.course_eligibility.courses
      if (c && !courseMap.has(c.id)) {
        courseMap.set(c.id, { id: c.id, name: c.name })
      }
    })
    setAvailableCourses(Array.from(courseMap.values()))
    setSelectedCourseId("")
    setEligibleGradeLevels([])
    setSelectedGradeLevelIds([])
    setGradeSearchQuery("")
    setShowGradeResults(false)
    setDisplayName("")
  }

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    const options = (selectedTeacherData?.teachers_course_eligibility || [])
      .filter((tce) => tce.course_eligibility.courses?.id === courseId)
      .map((tce) => ({
        gradeLevelId: tce.course_eligibility.grade_levels?.id || "",
        gradeLevelName: tce.course_eligibility.grade_levels?.name || "No grade",
        eligibilityId: tce.course_eligibility.id,
      }))
    setEligibleGradeLevels(options)
    setSelectedGradeLevelIds([])
    setGradeSearchQuery("")
    setShowGradeResults(false)
  }

  const handleAddGradeLevel = (gradeLevelId: string) => {
    setSelectedGradeLevelIds((prev) =>
      prev.includes(gradeLevelId) ? prev : [...prev, gradeLevelId]
    )
    setGradeSearchQuery("")
    setShowGradeResults(false)
  }

  const handleRemoveGradeLevel = (gradeLevelId: string) => {
    setSelectedGradeLevelIds((prev) => prev.filter((id) => id !== gradeLevelId))
  }

  const filteredEligibleGradeLevels = eligibleGradeLevels.filter(
    (g) =>
      !selectedGradeLevelIds.includes(g.gradeLevelId) &&
      (gradeSearchQuery.trim() === "" ||
        g.gradeLevelName.toLowerCase().includes(gradeSearchQuery.toLowerCase()))
  )

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (scheduleSlots.some((slot) => !slot.dayOfWeek || !isValidWeekDay(slot.dayOfWeek))) {
      toast({
        title: "Validation Error",
        description: "Please select a valid day for all schedule slots.",
        variant: "destructive",
      })
      return
    }

    if (!selectedTeacherData || selectedGradeLevelIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a teacher and at least one eligible class/grade.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const anchorEligibilityId = eligibleGradeLevels.find(
        (g) => g.gradeLevelId === selectedGradeLevelIds[0]
      )?.eligibilityId || ""

      const coursePayload = {
        teacher_id: selectedTeacherData.id,
        percentage_cut: newCourse.percentageCut,
        course_eligibility_id: anchorEligibilityId,
        price: newCourse.price,
        monthly_price: newCourse.price,
        display_name: displayName || null,
        compensation_type: newCourse.compensationType,
        fixed_salary_amount: newCourse.compensationType === 'fixed_salary' ? newCourse.fixedSalaryAmount : null,
        is_individual: newCourse.isIndividual,
        max_students: newCourse.isIndividual ? 2 : null,
        grade_level_ids: selectedGradeLevelIds,
      }
      const validScheduleSlots = scheduleSlots.filter(s => s.dayOfWeek && s.dayOfWeek.trim() !== "")
      const schedule: TablesInsert<"course_schedule">[] = validScheduleSlots.map(s => {
        return {
          course_id: '',
          day: s.dayOfWeek as Database['public']['Enums']['week_day'],
          start_time: s.startHour,
          end_time: calculateEndTime(s.startHour, s.duration)
        }
      })
      await courseInstancesService.addCourseInstance(coursePayload, schedule)
      const updatedCourses = await courseInstancesService.getAllCourseInstances()
      onCourseAdded(updatedCourses.data)

      // Reset
      setNewCourse({
        teacherId: "",
        percentageCut: 50,
        price: 500,
        compensationType: "percentage",
        fixedSalaryAmount: 0,
        isIndividual: false,
      })
      setScheduleSlots([{ dayOfWeek: "", startHour: "09:00", duration: 2 }])
      setTeacherSearchQuery("")
      setDisplayName("")
      setSelectedTeacherData(undefined)
      setAvailableCourses([])
      setSelectedCourseId("")
      setEligibleGradeLevels([])
      setSelectedGradeLevelIds([])
      setGradeSearchQuery("")
      setShowGradeResults(false)
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
          <DialogTitle>Add New Class Instance</DialogTitle>
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
                  onChange={(e) => handleTeacherSearch(e.target.value)}
                  onBlur={() => setTimeout(() => setShowTeacherResults(false), 150)}
                  onFocus={() => setShowTeacherResults(teacherSearchQuery.length > 0 && !selectedTeacherData)}
                  required
                />
                {showTeacherResults && filteredTeachers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    {filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onMouseDown={() => handleTeacherSelect(teacher)}
                      >
                        <div className="font-medium">{teacher.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Course Template */}
            <div className="space-y-2">
              <Label htmlFor="courseTemplate">Course</Label>
              <Select
                value={selectedCourseId}
                onValueChange={handleCourseChange}
                disabled={!selectedTeacherData}
              >
                <SelectTrigger id="courseTemplate">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
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

            {/* Eligible Classes & Grades (search-and-select badges) */}
            <div className="space-y-2 md:col-span-2">
              <Label>Eligible Classes & Grades</Label>
              <div className="flex flex-wrap gap-2 min-h-8 p-2 border rounded-md bg-gray-50/50">
                {selectedGradeLevelIds.length === 0 ? (
                  <span className="text-xs text-gray-400 self-center">No grade levels selected.</span>
                ) : (
                  selectedGradeLevelIds.map((id) => {
                    const level = eligibleGradeLevels.find((g) => g.gradeLevelId === id)
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1 pr-1.5">
                        {level?.gradeLevelName || "Unknown"}
                        <button
                          type="button"
                          onClick={() => handleRemoveGradeLevel(id)}
                          className="rounded-full outline-none hover:bg-gray-200 p-0.5 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })
                )}
              </div>
              <div className="relative">
                <Input
                  id="gradeLevelSearch"
                  placeholder="Search to add a grade level..."
                  autoComplete="off"
                  value={gradeSearchQuery}
                  disabled={eligibleGradeLevels.length === 0}
                  onChange={(e) => {
                    setGradeSearchQuery(e.target.value)
                    setShowGradeResults(e.target.value.length > 0)
                  }}
                  onBlur={() => setTimeout(() => setShowGradeResults(false), 150)}
                  onFocus={() => setShowGradeResults(gradeSearchQuery.length > 0)}
                />
                {showGradeResults && filteredEligibleGradeLevels.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    {filteredEligibleGradeLevels.map((level) => (
                      <div
                        key={level.gradeLevelId}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                        onMouseDown={() => handleAddGradeLevel(level.gradeLevelId)}
                      >
                        <div className="font-medium text-sm text-gray-900">{level.gradeLevelName}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="ciPrice">Student Tuition Price</Label>
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
                <Label htmlFor="percentageCut">Revenue Share (%)</Label>
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
                <Label htmlFor="fixedSalary">Teacher Salary</Label>
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
                Max 2 students
              </p>
            )}

            {/* Schedule Slots */}
            <div className="space-y-3 md:col-span-2 border border-slate-100 p-4 rounded-lg bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-semibold text-slate-800">
                  Course Schedule Slots
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
              {isSubmitting ? "Adding..." : "Add Class Instance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
