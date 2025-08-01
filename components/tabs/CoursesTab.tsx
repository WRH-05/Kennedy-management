"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Plus, Archive } from "lucide-react"
import { courseService, teacherService } from "@/services/appDataService"

interface CoursesTabProps {
  courses: any[]
  teachers: any[]
  students: any[]
  onCoursesUpdate: (courses: any[]) => void
  canAdd?: boolean
}

export default function CoursesTab({ 
  courses, 
  teachers, 
  students, 
  onCoursesUpdate, 
  canAdd = false 
}: CoursesTabProps) {
  const router = useRouter()
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  
  const [newCourse, setNewCourse] = useState({
    teacherId: "",
    teacherName: "",
    subject: "",
    schoolYear: "",
    percentageCut: 50,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "",
    startHour: "09:00",
    price: 500,
  })

  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [showTeacherResults, setShowTeacherResults] = useState(false)
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([])

  useEffect(() => {
    if (teacherSearchQuery.trim()) {
      const filtered = teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()),
      )
      setFilteredTeachers(filtered)
      setShowTeacherResults(true)
    } else {
      setFilteredTeachers([])
      setShowTeacherResults(false)
    }
  }, [teacherSearchQuery, teachers])

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourse.teacherId) return

    try {
      const teacher = teachers.find((t: any) => t.id.toString() === newCourse.teacherId)
      if (!teacher) return

      const endHour = calculateEndHour(newCourse.startHour, newCourse.duration)

      const course = {
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject: newCourse.subject,
        schoolYear: newCourse.schoolYear,
        percentageCut: newCourse.percentageCut,
        courseType: newCourse.courseType,
        duration: newCourse.duration,
        dayOfWeek: newCourse.dayOfWeek,
        startHour: newCourse.startHour,
        endHour: endHour,
        schedule: `${newCourse.dayOfWeek} ${newCourse.startHour}-${endHour}`,
        price: newCourse.price,
        enrolledStudents: [],
        status: "active",
        payments: {
          students: {},
          teacherPaid: false,
        },
      }
      await courseService.addCourseInstance(course)
      const updatedCourses = await courseService.getAllCourseInstances()
      onCoursesUpdate(updatedCourses)
      setNewCourse({
        teacherId: "",
        teacherName: "",
        subject: "",
        schoolYear: "",
        percentageCut: 50,
        courseType: "Group",
        duration: 2,
        dayOfWeek: "",
        startHour: "09:00",
        price: 500,
      })
      setShowAddCourseDialog(false)
    } catch (error) {
      // Error adding course
    }
  }

  const calculateEndHour = (startHour: string, duration: number) => {
    const [hours, minutes] = startHour.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration * 60
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
  }

  const handleArchiveCourse = async (courseId: number, courseName: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || '{}')
      
      // Create archive request in database
      // This would be implemented with a proper database call
      // For now, we'll just mark the course as archived directly
      await courseService.archiveCourse(courseId)
      
      // Update local state
      const updatedCourses = await courseService.getAllCourseInstances()
      onCoursesUpdate(updatedCourses)
    } catch (error) {
      // Error creating archive request
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            All Courses
          </CardTitle>
          {canAdd && (
            <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="text-sm text-gray-600">{teacher.subjects.join(", ")}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {newCourse.teacherName && (
                        <div className="text-sm text-green-600">Selected: {newCourse.teacherName}</div>
                      )}
                    </div>
                    {newCourse.teacherId && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Select
                            value={newCourse.subject}
                            onValueChange={(value) => setNewCourse({ ...newCourse, subject: value })}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers
                                .find((t) => t.id.toString() === newCourse.teacherId)
                                ?.subjects.map((subject: string) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schoolYear">School Year</Label>
                          <Select
                            value={newCourse.schoolYear}
                            onValueChange={(value) => setNewCourse({ ...newCourse, schoolYear: value })}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select school year" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers
                                .find((t) => t.id.toString() === newCourse.teacherId)
                                ?.schoolYears.map((year: string) => (
                                  <SelectItem key={year} value={year}>
                                    {year}
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
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, percentageCut: Number.parseInt(e.target.value) })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseType">Course Type</Label>
                      <Select
                        value={newCourse.courseType}
                        onValueChange={(value) => setNewCourse({ ...newCourse, courseType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Group">Group</SelectItem>
                          <SelectItem value="Individual">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input
                        id="duration"
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="4"
                        value={newCourse.duration}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, duration: Number.parseFloat(e.target.value) })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dayOfWeek">Day of the Week</Label>
                      <Select
                        value={newCourse.dayOfWeek}
                        onValueChange={(value) => setNewCourse({ ...newCourse, dayOfWeek: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monday">Monday</SelectItem>
                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                          <SelectItem value="Thursday">Thursday</SelectItem>
                          <SelectItem value="Friday">Friday</SelectItem>
                          <SelectItem value="Saturday">Saturday</SelectItem>
                          <SelectItem value="Sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startHour">Start Hour</Label>
                      <Input
                        id="startHour"
                        type="time"
                        value={newCourse.startHour}
                        onChange={(e) => setNewCourse({ ...newCourse, startHour: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        {newCourse.courseType === "Group" ? "Monthly Price" : "Session Price"} (DA)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({ ...newCourse, price: Number.parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Hour (Calculated)</Label>
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        {newCourse.startHour && newCourse.duration
                          ? calculateEndHour(newCourse.startHour, newCourse.duration)
                          : "--:--"}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddCourseDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Course</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => {
              const enrolledStudents = students.filter((s) => course.enrolledStudents?.includes(s.id))
              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        course.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium text-left"
                      onClick={() => router.push(`/course/${course.id}`)}
                    >
                      {course.subject} - {course.schoolYear}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium text-left"
                      onClick={() => router.push(`/teacher/${course.teacherId}`)}
                    >
                      {course.teacherName}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.courseType === "Group" ? "default" : "secondary"}>
                      {course.courseType}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.schedule}</TableCell>
                  <TableCell>{enrolledStudents.length} students</TableCell>
                  <TableCell>
                    {course.price} DA {course.courseType === "Group" ? "/month" : "/session"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchiveCourse(course.id, `${course.subject} - ${course.schoolYear}`)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
