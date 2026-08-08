"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CourseInstanceDetail, courseInstancesService } from "@/services/courseInstancesService"
import { mapSchedulesToSlots, type ScheduleSlot } from "@/lib/schedule"

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
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([])
  const [displayName, setDisplayName] = useState("")

  // Fetch full course instance detail when dialog opens
  useEffect(() => {
    if (open && courseInstanceId) {
      setIsLoading(true)
      courseInstancesService
        .getCourseInstanceById(courseInstanceId)
        .then((data) => {
          setCourseInstance(data)
          setPrice(data.price || 0)
          setPercentageCut(data.percentage_cut || 50)
          setCompensationType((data as any).compensation_type || "percentage")
          setFixedSalaryAmount((data as any).fixed_salary_amount || 0)
          setIsIndividual((data as any).is_individual || false)
          setScheduleSlots(mapSchedulesToSlots(data.course_schedule || []))
          setDisplayName(data.display_name || "")
        })
        .catch((err) => {
          console.error("Failed to load course instance:", err)
          toast({ title: "Error", description: "Failed to load course instance data.", variant: "destructive" })
          onOpenChange(false)
        })
        .finally(() => setIsLoading(false))
    }
  }, [open, courseInstanceId, onOpenChange, toast])

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...scheduleSlots]
    updated[index] = { ...updated[index], [field]: value }
    setScheduleSlots(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (scheduleSlots.some((slot) => !slot.day)) {
      toast({
        title: "Validation Error",
        description: "Please assign valid weekdays to all schedule slots.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const calculateEndTime = (startTimeStr: string | undefined, durationHours: number) => {
        if (!startTimeStr) return "00:00"
        const [hours, minutes] = startTimeStr.split(":").map(Number)
        const totalMinutes = hours * 60 + minutes + Math.round(durationHours * 60)
        const endHours = Math.floor(totalMinutes / 60) % 24
        const endMinutes = totalMinutes % 60
        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`
      }

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
          max_students: isIndividual ? 2 : null,
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-ci-price">Student Tuition Price</Label>
                <Input
                  id="edit-ci-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            {/* Compensation Type */}
            <div className="space-y-1">
              <Label htmlFor="edit-ci-comp-type">Teacher Compensation</Label>
              <Select value={compensationType} onValueChange={(v) => setCompensationType(v as "percentage" | "fixed_salary")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Cut</SelectItem>
                  <SelectItem value="fixed_salary">Fixed Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {compensationType === 'percentage' ? (
              <div className="space-y-1">
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
              <div className="space-y-1">
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

            <div className="space-y-1">
              <Label htmlFor="edit-ci-display-name">Display Name</Label>
              <Input
                id="edit-ci-display-name"
                placeholder="Course Name - Grade Level"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* Individual Course Toggle */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="edit-is-individual"
                checked={isIndividual}
                onCheckedChange={(checked) => setIsIndividual(checked as boolean)}
              />
              <Label htmlFor="edit-is-individual">Individual Course / Private Lesson</Label>
            </div>
            {isIndividual && (
              <p className="text-xs text-amber-600 -mt-1 ml-6">Max 2 students</p>
            )}

            <div className="pt-2 border-t space-y-2">
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
