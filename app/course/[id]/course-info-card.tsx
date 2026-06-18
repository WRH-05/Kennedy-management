// components/course-info-card.tsx
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Edit3, Plus, Trash2 } from "lucide-react"
import { formatScheduleString, mapSchedulesToSlots } from "./utils"
import { courseService } from "@/services/courseService"
import { useToast } from "@/hooks/use-toast"

export function CourseInfoCard({ course, courseId, onRefresh }: { course: any, courseId: string, onRefresh: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const [showEditCourseDialog, setShowEditCourseDialog] = useState(false)
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false)
  
  const [editForm, setEditForm] = useState({
    subject: course.subject || "",
    schoolYear: course.school_year || "",
    courseType: course.course_type || "Group",
    price: course.price || 0,
    percentageCut: course.percentage_cut || 50,
    status: course.status || "active"
  })
  const [editScheduleSlots, setEditScheduleSlots] = useState<any[]>(mapSchedulesToSlots(course.course_schedule))

  const handleEditScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...editScheduleSlots]
    updated[index] = { ...updated[index], [field]: value }
    setEditScheduleSlots(updated)
  }

  const handleUpdateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUpdatingCourse) return

    if (editScheduleSlots.some(slot => !slot.dayOfWeek)) {
      toast({ title: "Validation Error", description: "Please assign valid weekdays to all schedule slots.", variant: "destructive" })
      return
    }

    setIsUpdatingCourse(true)
    try {
      await courseService.updateCourseInstance(courseId, {
        subject: editForm.subject,
        school_year: editForm.schoolYear,
        course_type: editForm.courseType,
        price: editForm.price,
        monthly_price: editForm.price,
        percentage_cut: editForm.percentageCut,
        status: editForm.status
      }, editScheduleSlots)
      
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
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditScheduleSlots([...editScheduleSlots, { dayOfWeek: "monday", startHour: "09:00", duration: 2 }])}>
                    <Plus className="h-3 w-3 mr-1" /> Slot
                  </Button>
                </div>
                {editScheduleSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <div className="flex-1 space-y-1">
                      <Select value={slot.dayOfWeek} onValueChange={(v) => handleEditScheduleChange(index, 'dayOfWeek', v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Day" /></SelectTrigger>
                        <SelectContent>
                          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(d => (
                            <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-1">
                        <Input type="time" className="h-8 text-xs px-1" value={slot.startHour} onChange={(e) => handleEditScheduleChange(index, 'startHour', e.target.value)} />
                        <Select value={slot.duration.toString()} onValueChange={(v) => handleEditScheduleChange(index, 'duration', parseFloat(v))}>
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
          <h3 className="font-semibold text-lg">{course.subject}</h3>
          <p className="text-gray-600">{course.school_year}</p>
        </div>
        <div className="space-y-2">
          <p><span className="font-medium">Teacher:</span> <Button variant="link" className="p-0 h-auto font-medium" onClick={() => router.push(`/teacher/${course.teacher_id}`)}>{course.teacher_name}</Button></p>
          <div>
            <span className="font-medium">Type:</span>
            <Badge variant={course.course_type === "Group" ? "default" : "secondary"} className="ml-2">{course.course_type}</Badge>
          </div>
          <p><span className="font-medium">Schedule:</span> {formatScheduleString(course.course_schedule)}</p>
          <p><span className="font-medium">{course.course_type === "Group" ? "Monthly Price" : "Session Price"}:</span> {course.price || 0} DA</p>
          <p><span className="font-medium">Teacher Cut:</span> {course.percentage_cut || 0}%</p>
          <p><span className="font-medium">Enrolled Students:</span> {course.student_ids?.length || 0}</p>
        </div>
        <div className="pt-4 border-t">
          <span className="font-medium">Status:</span>
          <Badge variant={course.status === "active" ? "default" : "secondary"} className="ml-2">{course.status}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}