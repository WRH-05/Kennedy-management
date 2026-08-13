"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CourseInstanceDetail, courseInstancesService } from "@/services/courseInstancesService"
import { teacherService } from "@/services/teacherService"
import { mapSchedulesToSlots, type ScheduleSlot, calculateEndTime, isValidWeekDay } from "@/lib/schedule"

interface UpdateCourseInstanceDialogProps {
  courseInstanceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}

export function UpdateCourseInstanceDialog({
  courseInstanceId,
  open,
  onOpenChange,
  onUpdated,
}: UpdateCourseInstanceDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [courseInstance, setCourseInstance] = useState<CourseInstanceDetail | null>(null)

  const [price, setPrice] = useState(0)
  const [percentageCut, setPercentageCut] = useState(50)
  const [compensationType, setCompensationType] = useState<"percentage" | "fixed_salary">("percentage")
  const [fixedSalaryAmount, setFixedSalaryAmount] = useState(0)
  const [isIndividual, setIsIndividual] = useState(false)
  const [maxStudents, setMaxStudents] = useState<number | null>(null)
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([])
  const [displayName, setDisplayName] = useState("")
  const [availableGradeLevels, setAvailableGradeLevels] = useState<{ id: string; name: string }[]>([])
  const [selectedGradeLevelIds, setSelectedGradeLevelIds] = useState<string[]>([])
  const [gradeSearchQuery, setGradeSearchQuery] = useState("")
  const [showGradeResults, setShowGradeResults] = useState(false)

  // Fetch full course instance detail when dialog opens
  useEffect(() => {
    if (open && courseInstanceId) {
      setIsLoading(true)
      setGradeSearchQuery("")
      setShowGradeResults(false)
      courseInstancesService
        .getCourseInstanceById(courseInstanceId)
        .then((data) => {
          setCourseInstance(data)
          setPrice(data.price || 0)
          setPercentageCut(data.percentage_cut || 50)
          setCompensationType((data as any).compensation_type || "percentage")
          setFixedSalaryAmount((data as any).fixed_salary_amount || 0)
          setIsIndividual((data as any).is_individual || false)
          setMaxStudents((data as any).max_students ?? null)
          setScheduleSlots(mapSchedulesToSlots(data.course_schedule || []))
          setDisplayName(data.display_name || "")
          const ce = data.course_eligibility as any
          const courseId = ce?.courses?.id
          const anchorId = ce?.grade_levels?.id
          teacherService
            .getTeacherById(data.teacher_id)
            .then((teacher) => {
              const options = (teacher?.teachers_course_eligibility || [])
                .filter((tce) => tce.course_eligibility.courses?.id === courseId)
                .map((tce) => ({
                  id: tce.course_eligibility.grade_levels?.id || "",
                  name: tce.course_eligibility.grade_levels?.name || "No grade",
                }))
              setAvailableGradeLevels(options)
              const existing = (data.grade_level_ids && data.grade_level_ids.length > 0)
                ? data.grade_level_ids
                : (anchorId ? [anchorId] : [])
              setSelectedGradeLevelIds(existing)
            })
            .catch((e) => console.error(e))
        })
        .catch((err) => {
          console.error("Failed to load course instance:", err)
          toast({ title: "Error", description: "Failed to load course instance data.", variant: "destructive" })
          onOpenChange(false)
        })
        .finally(() => setIsLoading(false))
    }
  }, [open, courseInstanceId, onOpenChange, toast])

  const regenerateDisplayName = (gradeLevelIds: string[]) => {
    const courseName = (courseInstance?.course_eligibility as any)?.courses?.name || ""
    const gradeNames = gradeLevelIds
      .map((id) => availableGradeLevels.find((g) => g.id === id)?.name)
      .filter(Boolean)
    setDisplayName(gradeNames.length ? `${courseName} - ${gradeNames.join(", ")}` : courseName)
  }

  const handleAddGradeLevel = (gradeLevelId: string) => {
    const next = selectedGradeLevelIds.includes(gradeLevelId)
      ? selectedGradeLevelIds
      : [...selectedGradeLevelIds, gradeLevelId]
    setSelectedGradeLevelIds(next)
    regenerateDisplayName(next)
    setGradeSearchQuery("")
    setShowGradeResults(false)
  }

  const handleRemoveGradeLevel = (gradeLevelId: string) => {
    const next = selectedGradeLevelIds.filter((id) => id !== gradeLevelId)
    setSelectedGradeLevelIds(next)
    regenerateDisplayName(next)
  }

  const filteredEligibleGradeLevels = availableGradeLevels.filter(
    (g) =>
      !selectedGradeLevelIds.includes(g.id) &&
      (gradeSearchQuery.trim() === "" || g.name.toLowerCase().includes(gradeSearchQuery.toLowerCase()))
  )

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...scheduleSlots]
    updated[index] = { ...updated[index], [field]: value }
    setScheduleSlots(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (scheduleSlots.some((slot) => !slot.day || !isValidWeekDay(slot.day))) {
      toast({
        title: "Validation Error",
        description: "Please assign valid weekdays to all schedule slots.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const validScheduleSlots = scheduleSlots.filter(s => s.day && s.day.trim() !== "")
      const formattedSlots = validScheduleSlots.map((slot) => {
        const cleanStartTime = slot.start_time?.slice(0, 5) || "00:00"
        return {
          day: slot.day,
          start_time: cleanStartTime,
          end_time: calculateEndTime(cleanStartTime, slot.duration || 0),
        }
      })

      await courseInstancesService.updateCourseInstance(
        courseInstanceId,
        {
          price,
          monthly_price: price,
          percentage_cut: percentageCut,
          display_name: displayName || null,
          compensation_type: compensationType,
          fixed_salary_amount: compensationType === 'fixed_salary' ? fixedSalaryAmount : null,
          is_individual: isIndividual,
          max_students: isIndividual ? (maxStudents ?? 2) : null,
          grade_level_ids: selectedGradeLevelIds,
        },
        formattedSlots
      )

      toast({ title: "Success", description: "Course updated successfully." })
      onUpdated()
      onOpenChange(false)
    } catch (err) {
      console.error("Error updating course instance:", err)
      toast({ title: "Error", description: "Failed to update course instance.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading course data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-ci-display-name">Display Name</Label>
                <Input
                  id="edit-ci-display-name"
                  placeholder="Course Name - Grade Level"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {/* Grade Levels (search-and-select badges) */}
              <div className="space-y-2">
                <Label>Grade Levels</Label>
                <div className="flex flex-wrap gap-2 min-h-8 p-2 border rounded-md bg-gray-50/50">
                  {selectedGradeLevelIds.length === 0 ? (
                    <span className="text-xs text-gray-400 self-center">No grade levels selected.</span>
                  ) : (
                    selectedGradeLevelIds.map((id) => {
                      const level = availableGradeLevels.find((g) => g.id === id)
                      return (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1 pr-1.5">
                          {level?.name || "Unknown"}
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
                    id="edit-ci-grade-search"
                    placeholder="Search to add a grade level..."
                    autoComplete="off"
                    value={gradeSearchQuery}
                    disabled={availableGradeLevels.length === 0}
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
                          key={level.id}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                          onMouseDown={() => handleAddGradeLevel(level.id)}
                        >
                          <div className="font-medium text-sm text-gray-900">{level.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Student Tuition Price */}
              <div className="space-y-2">
                <Label htmlFor="edit-ci-price">Student Tuition Price</Label>
                <Input
                  id="edit-ci-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              {/* Teacher Compensation */}
              <div className="space-y-2">
                <Label htmlFor="edit-ci-comp-type">Teacher Compensation</Label>
                <Select value={compensationType} onValueChange={(v) => setCompensationType(v as "percentage" | "fixed_salary")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Cut</SelectItem>
                    <SelectItem value="fixed_salary">Fixed Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Revenue Share / Fixed Salary */}
              {compensationType === 'percentage' ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-ci-cut">Revenue Share (%)</Label>
                  <Input
                    id="edit-ci-cut"
                    type="number"
                    min="0"
                    max="100"
                    value={percentageCut}
                    onChange={(e) => setPercentageCut(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edit-ci-fixed-salary">Teacher Salary</Label>
                  <Input
                    id="edit-ci-fixed-salary"
                    type="number"
                    value={fixedSalaryAmount}
                    onChange={(e) => setFixedSalaryAmount(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              )}

              {/* Individual Course Toggle */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="edit-is-individual"
                    checked={isIndividual}
                    onCheckedChange={(checked) => setIsIndividual(checked as boolean)}
                  />
                  <Label htmlFor="edit-is-individual">Individual Course / Private Lesson</Label>
                </div>
                {isIndividual && (
                  <div className="space-y-1 ml-6">
                    <Label htmlFor="edit-max-students">Max Students</Label>
                    <Input
                      id="edit-max-students"
                      type="number"
                      min="1"
                      max="10"
                      value={maxStudents ?? 2}
                      onChange={(e) => setMaxStudents(parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}
              </div>

              {/* Weekly Schedule Slots */}
              <div className="pt-2 border-t space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Weekly Schedule Slots</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      setScheduleSlots([...scheduleSlots, { day: "monday", start_time: "09:00", duration: 2 }])
                    }
                  >
                    <Plus className="h-3 w-3 mr-1" /> Slot
                  </Button>
                </div>
                {scheduleSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <div className="flex-1 space-y-1">
                      <Select value={slot.day} onValueChange={(v) => handleScheduleChange(index, "day", v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((d) => (
                            <SelectItem key={d} value={d}>
                              {d.charAt(0).toUpperCase() + d.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-1">
                        <Input
                          type="time"
                          className="h-8 text-xs px-1"
                          value={slot.start_time?.slice(0, 5)}
                          onChange={(e) => handleScheduleChange(index, "start_time", e.target.value)}
                        />
                        <Select
                          value={slot.duration?.toString()}
                          onValueChange={(v) => handleScheduleChange(index, "duration", parseFloat(v))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["1", "1.5", "2", "2.5"].map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}h
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                      onClick={() => setScheduleSlots(scheduleSlots.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
