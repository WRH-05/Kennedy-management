// components/course-info-card.tsx
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Edit3, Plus, Trash2 } from "lucide-react"
import { formatScheduleString, mapSchedulesToSlots } from "./utils"
import { CourseInstanceDetail, courseInstancesService } from "@/services/courseInstancesService"
import { useToast } from "@/hooks/use-toast"
import { TablesUpdate } from "@/types/database.types"

export function CourseInstancesInfoCard({ courseInstances, onRefresh }: { courseInstances: CourseInstanceDetail, onRefresh: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const [showEditCourseDialog, setShowEditCourseDialog] = useState(false)
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false)

  const [editForm, setEditForm] = useState({
    price: courseInstances.price || 0,
    percentageCut: courseInstances.percentage_cut || 50
  })

  // State initialization matches database keys: { day, start_time, duration }
  const [editScheduleSlots, setEditScheduleSlots] = useState<{day: "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday", start_time: string, duration: number}[]>(
    mapSchedulesToSlots(courseInstances.course_schedule)
  )

  const handleEditScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...editScheduleSlots]
    updated[index] = { ...updated[index], [field]: value }
    setEditScheduleSlots(updated)
  }

  const handleUpdateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUpdatingCourse) return

    if (editScheduleSlots.some(slot => !slot.day)) {
      toast({ title: "Validation Error", description: "Please assign valid weekdays to all schedule slots.", variant: "destructive" })
      return
    }

    setIsUpdatingCourse(true)
    try {
      const calculateEndTime = (startTimeStr: string | undefined, durationHours: number) => {
        if (!startTimeStr) return "00:00";

        // Split "HH:MM" into numbers
        const [hours, minutes] = startTimeStr.split(':').map(Number);

        // Convert everything to total minutes, add duration, and convert back
        const totalMinutes = (hours * 60) + minutes + Math.round(durationHours * 60);

        const endHours = Math.floor(totalMinutes / 60) % 24; // % 24 prevents overflow past midnight
        const endMinutes = totalMinutes % 60;

        // Pad single digits with a leading zero (e.g., 9 becomes "09")
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
      };

      // Your updated mapping block
      const formattedSlotsForService = editScheduleSlots.map(slot => {
        const cleanStartTime = slot.start_time?.slice(0, 5) || "00:00";

        return {
          day: slot.day,
          start_time: cleanStartTime,
          end_time: calculateEndTime(cleanStartTime, slot.duration || 0)
        };
      });

      await courseInstancesService.updateCourseInstance(courseInstances.id, {
        price: editForm.price,
        monthly_price: editForm.price,
        percentage_cut: editForm.percentageCut,
      }, formattedSlotsForService)

      toast({ title: "Success", description: "Course updated successfully." })
      setShowEditCourseDialog(false)
      onRefresh()
    } catch {
      toast({ title: "Error", variant: "destructive" })
    } finally {
      setIsUpdatingCourse(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="flex items-center text-md font-medium">
          <BookOpen className="h-5 w-5 mr-2" /> Course Information
        </CardTitle>
        <Dialog open={showEditCourseDialog} onOpenChange={setShowEditCourseDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2"><Edit3 className="h-4 w-4 mr-1" /> Edit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Course Details</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdateCourseSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="price">Price (DA)</Label>
                  <Input id="price" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cut">Teacher Cut (%)</Label>
                  <Input id="cut" type="number" value={editForm.percentageCut} onChange={(e) => setEditForm({ ...editForm, percentageCut: parseInt(e.target.value) || 0 })} required />
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Weekly Schedule Slots</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditScheduleSlots([...editScheduleSlots, { day: "monday", start_time: "09:00", duration: 2 }])}>
                    <Plus className="h-3 w-3 mr-1" /> Slot
                  </Button>
                </div>
                {editScheduleSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <div className="flex-1 space-y-1">
                      {/* FIXED: Changed target field name from 'dayOfWeek' to 'day' */}
                      <Select value={slot.day} onValueChange={(v) => handleEditScheduleChange(index, 'day', v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Day" /></SelectTrigger>
                        <SelectContent>
                          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(d => (
                            <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-1">
                        {/* FIXED: Changed target field name from 'startHour' to 'start_time' */}
                        <Input type="time" className="h-8 text-xs px-1" value={slot.start_time?.slice(0, 5)} onChange={(e) => handleEditScheduleChange(index, 'start_time', e.target.value)} />
                        <Select value={slot.duration?.toString()} onValueChange={(v) => handleEditScheduleChange(index, 'duration', parseFloat(v))}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["1", "1.5", "2", "2.5"].map(h => <SelectItem key={h} value={h}>{h}h</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => setEditScheduleSlots(editScheduleSlots.filter((_, i) => i !== index))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setShowEditCourseDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={isUpdatingCourse}>{isUpdatingCourse ? "Saving..." : "Save Variations"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{courseInstances.course_eligibility?.courses?.name ?? "—"}</h3>
          <p className="text-gray-600">{courseInstances.course_eligibility?.grade_levels?.name ?? "—"}</p>
        </div>
        <div className="space-y-2">
          <p><span className="font-medium">Teacher:</span> <Button variant="link" className="p-0 h-auto font-medium" onClick={() => router.push(`/teacher/${courseInstances.teacher_id}`)}>{courseInstances.teachers?.name}</Button></p>
          <p><span className="font-medium">Schedule:</span> {formatScheduleString(courseInstances.course_schedule)}</p>
        </div>
      </CardContent>
    </Card>
  )
}