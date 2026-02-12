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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Plus, Archive, MoreHorizontal, Pencil } from "lucide-react"
import { courseService, teacherService, archiveService } from "@/services/appDataService"
import { useToast } from "@/hooks/use-toast"

interface CoursesTabProps {
  courses: any[]
  teachers: any[]
  students: any[]
  onCoursesUpdate: (courses: any[]) => void
  canAdd?: boolean
  pendingArchiveIds?: Set<string>
}

export default function CoursesTab({ 
  courses, 
  teachers, 
  students, 
  onCoursesUpdate, 
  canAdd = false,
  pendingArchiveIds = new Set()
}: CoursesTabProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPrivateStudents, setSelectedPrivateStudents] = useState<string[]>([])
  
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
    if (isSubmitting) return // Prevent double submission
    
    if (!newCourse.teacherId) {
      toast({
        title: "Validation Error",
        description: "Please select a teacher",
        variant: "destructive",
      })
      return
    }
    
    if (!newCourse.subject) {
      toast({
        title: "Validation Error",
        description: "Please select a subject",
        variant: "destructive",
      })
      return
    }
    
    if (!newCourse.schoolYear) {
      toast({
        title: "Validation Error",
        description: "Please select a school year",
        variant: "destructive",
      })
      return
    }

    if (newCourse.courseType === "Private" && selectedPrivateStudents.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one student for private course",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log("Adding course:", newCourse)
      const teacher = teachers.find((t: any) => t.id.toString() === newCourse.teacherId)
      if (!teacher) {
        toast({
          title: "Error",
          description: "Selected teacher not found",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const endHour = calculateEndHour(newCourse.startHour, newCourse.duration)

      const course = {
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        subject: newCourse.subject,
        school_year: newCourse.schoolYear,
        percentage_cut: newCourse.percentageCut,
        course_type: newCourse.courseType,
        duration: newCourse.duration,
        schedule: `${newCourse.dayOfWeek} ${newCourse.startHour}-${endHour}`,
        price: newCourse.price,
        monthly_price: newCourse.price,
        student_ids: newCourse.courseType === "Private" ? selectedPrivateStudents : [],
        status: "active"
      }
      console.log("Course object to add:", course)
      await courseService.addCourseInstance(course)
      console.log("Course added successfully")
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
      setSelectedPrivateStudents([])
      setShowAddCourseDialog(false)
      toast({
        title: "Course added",
        description: `${course.subject} - ${course.school_year} has been successfully added.`,
      })
    } catch (error) {
      console.error("Error adding course:", error)
      toast({
        title: "Error",
        description: "Failed to add course: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
      // Create archive request in database
      await archiveService.createArchiveRequest('course', courseId, courseName)
      
      // Show visual feedback (request created, will be processed by manager)
      toast({
        title: "Archive request submitted",
        description: "Waiting for manager approval.",
      })
    } catch (error) {
      console.error('Error creating archive request:', error)
      toast({
        title: "Error",
        description: "Failed to create archive request.",
        variant: "destructive",
      })
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
                                <div className="text-sm text-gray-600">
                                  {teacher.subjects ? (Array.isArray(teacher.subjects) 
                                    ? teacher.subjects 
                                    : (typeof teacher.subjects === 'string' ? teacher.subjects.split(',') : [])
                                  ).filter((s: string) => s && s.trim()).map((s: string) => s.trim()).join(", ") : 'No subjects'}
                                </div>
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
                              {(function() {
                                const teacher = teachers.find((t) => t.id.toString() === newCourse.teacherId);
                                const subjects = teacher?.subjects;
                                if (!subjects) return null;
                                const subjectsList = Array.isArray(subjects) 
                                  ? subjects 
                                  : (typeof subjects === 'string' ? subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []);
                                return subjectsList.map((subject: string) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ));
                              })()}
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
                              {(function() {
                                const teacher = teachers.find((t) => t.id.toString() === newCourse.teacherId);
                                const schoolYears = teacher?.school_years;
                                if (!schoolYears) return null;
                                const yearsList = Array.isArray(schoolYears) ? schoolYears : schoolYears.split(',');
                                return yearsList.map((year: string) => (
                                  <SelectItem key={year.trim()} value={year.trim()}>
                                    {year.trim()}
                                  </SelectItem>
                                ));
                              })()}
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
                        onValueChange={(value) => {
                          setNewCourse({ ...newCourse, courseType: value })
                          if (value !== "Private") {
                            setSelectedPrivateStudents([])
                          }
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
                    {newCourse.courseType === "Private" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>Select Students (max 2)</Label>
                        <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                          {students.map((student) => (
                            <div key={student.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`student-${student.id}`}
                                checked={selectedPrivateStudents.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    if (selectedPrivateStudents.length < 2) {
                                      setSelectedPrivateStudents([...selectedPrivateStudents, student.id])
                                    }
                                  } else {
                                    setSelectedPrivateStudents(selectedPrivateStudents.filter(id => id !== student.id))
                                  }
                                }}
                                disabled={!selectedPrivateStudents.includes(student.id) && selectedPrivateStudents.length >= 2}
                              />
                              <Label htmlFor={`student-${student.id}`} className="text-sm cursor-pointer">
                                {student.name} - {student.school_year}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {selectedPrivateStudents.length > 0 && (
                          <div className="text-sm text-green-600">
                            Selected: {selectedPrivateStudents.length}/2 student(s)
                          </div>
                        )}
                      </div>
                    )}
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
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Course"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[455px] overflow-auto scrollbar-thin">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const enrolledStudents = students.filter((s) => course.student_ids?.includes(s.id))
                return (
                  <TableRow key={course.id} className="group">
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
                        {course.subject} - {course.school_year}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/teacher/${course.teacher_id}`)}
                      >
                        {course.teacher_name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.course_type === "Group" ? "default" : "secondary"}>
                        {course.course_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.schedule}</TableCell>
                    <TableCell>{enrolledStudents.length} students</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <span>{course.price} DA {course.course_type === "Group" ? "/month" : "/session"}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/course/${course.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleArchiveCourse(course.id, `${course.subject} - ${course.school_year}`)}
                              className={pendingArchiveIds.has(course.id) ? "text-gray-400 cursor-not-allowed" : "text-orange-600"}
                              disabled={pendingArchiveIds.has(course.id)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {pendingArchiveIds.has(course.id) ? "Archive Pending" : "Archive"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
