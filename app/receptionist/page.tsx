"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LogOut, Users, Search, GraduationCap, BookOpen, Plus } from "lucide-react"
import { studentService, teacherService, courseService } from "@/src/services/dataService"

export default function ReceptionistDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)

  // Form states
  const [newStudent, setNewStudent] = useState({
    name: "",
    schoolYear: "",
    specialty: "",
    address: "",
    birthDate: "",
    phone: "",
    email: "",
    school: "",
    photos: false,
    copyOfId: false,
    registrationForm: false,
    registrationFeePaid: false,
  })

  // New teacher form state
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    school: "",
    schoolYears: [] as string[],
    subjects: [] as string[],
  })

  // Update the course form state
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

  // Add teacher search state
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [showTeacherResults, setShowTeacherResults] = useState(false)
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "receptionist") {
        router.push("/")
        return
      }
      setUser(parsedUser)
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [studentsData, teachersData, coursesData] = await Promise.all([
          studentService.getAllStudents(),
          teacherService.getAllTeachers(),
          courseService.getAllCourseInstances(),
        ])

        setStudents(studentsData)
        setTeachers(teachersData)
        setCourses(coursesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Enhanced search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const studentResults = students
        .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((student) => ({ ...student, type: "student" }))

      const teacherResults = teachers
        .filter((teacher) => teacher.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((teacher) => ({ ...teacher, type: "teacher" }))

      const courseResults = courses
        .filter(
          (course) =>
            course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.schoolYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((course) => ({ ...course, type: "course" }))

      setSearchResults([...studentResults, ...teacherResults, ...courseResults])
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, students, teachers, courses])

  // Add useEffect for teacher search
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

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const student = {
        name: newStudent.name,
        schoolYear: newStudent.schoolYear,
        specialty: newStudent.specialty,
        address: newStudent.address,
        birthDate: newStudent.birthDate,
        phone: newStudent.phone,
        email: newStudent.email,
        school: newStudent.school,
        registrationFeePaid: newStudent.registrationFeePaid,
      }
      await studentService.addStudent(student)
      const updatedStudents = await studentService.getAllStudents()
      setStudents(updatedStudents)
      setNewStudent({
        name: "",
        schoolYear: "",
        specialty: "",
        address: "",
        birthDate: "",
        phone: "",
        email: "",
        school: "",
        photos: false,
        copyOfId: false,
        registrationForm: false,
        registrationFeePaid: false,
      })
      setShowAddStudentDialog(false)
    } catch (error) {
      console.error('Error adding student:', error)
    }
  }

  // Update handleAddTeacher function
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const teacher = {
        name: newTeacher.name,
        address: newTeacher.address,
        phone: newTeacher.phone,
        email: newTeacher.email,
        school: newTeacher.school,
        schoolYears: newTeacher.schoolYears,
        subjects: newTeacher.subjects,
      }
      await teacherService.addTeacher(teacher)
      const updatedTeachers = await teacherService.getAllTeachers()
      setTeachers(updatedTeachers)
      setNewTeacher({
        name: "",
        address: "",
        phone: "",
        email: "",
        school: "",
        schoolYears: [],
        subjects: [],
      })
      setShowAddTeacherDialog(false)
    } catch (error) {
      console.error('Error adding teacher:', error)
    }
  }

  // Update handleAddCourse function
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
      setCourses(updatedCourses)
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
      console.error('Error adding course:', error)
    }
  }

  // Add helper function for calculating end hour
  const calculateEndHour = (startHour: string, duration: number) => {
    const [hours, minutes] = startHour.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration * 60
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
  }

  // Add helper function for handling multiple selections
  const handleMultiSelect = (value: string, currentArray: string[], setter: (arr: string[]) => void) => {
    if (currentArray.includes(value)) {
      setter(currentArray.filter((item) => item !== value))
    } else {
      setter([...currentArray, value])
    }
  }

  const handleSearchResultClick = (result: any) => {
    if (result.type === "student") {
      router.push(`/student/${result.id}`)
    } else if (result.type === "teacher") {
      router.push(`/teacher/${result.id}`)
    } else if (result.type === "course") {
      router.push(`/course/${result.id}`)
    }
    setSearchQuery("")
    setShowSearchResults(false)
  }

  const getStudentCourses = (studentId: number) => {
    return courses.filter((course) => course.enrolledStudents.includes(studentId))
  }

  if (!user || loading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Receptionist Dashboard</h1>

            {/* Enhanced Global Search */}
            <div className="flex-1 max-w-md mx-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students, teachers, courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Enhanced Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.name || result.subject}</span>
                        <Badge
                          variant={
                            result.type === "student" ? "default" : result.type === "teacher" ? "secondary" : "outline"
                          }
                        >
                          {result.type === "student" ? "Student" : result.type === "teacher" ? "Teacher" : "Course"}
                        </Badge>
                      </div>
                      {result.type === "student" && (
                        <p className="text-sm text-gray-600">
                          {result.schoolYear} - {result.school}
                        </p>
                      )}
                      {result.type === "teacher" && (
                        <p className="text-sm text-gray-600">{result.subjects?.join(", ")}</p>
                      )}
                      {result.type === "course" && (
                        <p className="text-sm text-gray-600">
                          {result.teacherName} - {result.schoolYear} - {result.schedule}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Student List
                  </CardTitle>
                  <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Student Name</Label>
                            <Input
                              id="name"
                              value={newStudent.name}
                              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="schoolYear">School Year</Label>
                            <Select
                              value={newStudent.schoolYear}
                              onValueChange={(value) => setNewStudent({ ...newStudent, schoolYear: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select school year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1AS">1AS</SelectItem>
                                <SelectItem value="2AS">2AS</SelectItem>
                                <SelectItem value="3AS">3AS</SelectItem>
                                <SelectItem value="BEM">BEM</SelectItem>
                                <SelectItem value="BAC">BAC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="specialty">Specialty</Label>
                            <Select
                              value={newStudent.specialty}
                              onValueChange={(value) => setNewStudent({ ...newStudent, specialty: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Math">Mathematics</SelectItem>
                                <SelectItem value="Sciences">Sciences</SelectItem>
                                <SelectItem value="Literature">Literature</SelectItem>
                                <SelectItem value="Languages">Languages</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={newStudent.address}
                              onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="birthDate">Birth Date</Label>
                            <Input
                              id="birthDate"
                              type="date"
                              value={newStudent.birthDate}
                              onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={newStudent.phone}
                              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newStudent.email}
                              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="school">School They Attend</Label>
                            <Input
                              id="school"
                              value={newStudent.school}
                              onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label>Document Checklist</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="photos"
                                checked={newStudent.photos}
                                onCheckedChange={(checked) =>
                                  setNewStudent({ ...newStudent, photos: checked as boolean })
                                }
                              />
                              <Label htmlFor="photos">Photos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="copyOfId"
                                checked={newStudent.copyOfId}
                                onCheckedChange={(checked) =>
                                  setNewStudent({ ...newStudent, copyOfId: checked as boolean })
                                }
                              />
                              <Label htmlFor="copyOfId">Copy of ID</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="registrationForm"
                                checked={newStudent.registrationForm}
                                onCheckedChange={(checked) =>
                                  setNewStudent({ ...newStudent, registrationForm: checked as boolean })
                                }
                              />
                              <Label htmlFor="registrationForm">Registration Form</Label>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="registrationFee"
                            checked={newStudent.registrationFeePaid}
                            onCheckedChange={(checked) =>
                              setNewStudent({ ...newStudent, registrationFeePaid: checked as boolean })
                            }
                          />
                          <Label htmlFor="registrationFee">Registration Fee Paid</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add Student</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead>Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const studentCourses = getStudentCourses(student.id)
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => router.push(`/student/${student.id}`)}
                            >
                              {student.name}
                            </Button>
                          </TableCell>
                          <TableCell>{student.schoolYear}</TableCell>
                          <TableCell>{student.specialty}</TableCell>
                          <TableCell>
                            {studentCourses.map((course, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1">
                                {course.subject}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            {studentCourses.map((course, idx) => (
                              <Badge
                                key={idx}
                                variant={course.payments.students[student.id] ? "default" : "destructive"}
                                className="mr-1"
                              >
                                {course.payments.students[student.id] ? "Paid" : "Pending"}
                              </Badge>
                            ))}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    All Courses
                  </CardTitle>
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
                                      ?.subjects.map((subject) => (
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
                                      ?.schoolYears.map((year) => (
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => {
                      const enrolledStudents = students.filter((s) => course.enrolledStudents.includes(s.id))
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
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Teacher List
                  </CardTitle>
                  <Dialog open={showAddTeacherDialog} onOpenChange={setShowAddTeacherDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Teacher
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Teacher</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddTeacher} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="profName">Full Name</Label>
                            <Input
                              id="profName"
                              value={newTeacher.name}
                              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profAddress">Address</Label>
                            <Input
                              id="profAddress"
                              value={newTeacher.address}
                              onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profPhone">Phone Number</Label>
                            <Input
                              id="profPhone"
                              value={newTeacher.phone}
                              onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profEmail">Email (Optional)</Label>
                            <Input
                              id="profEmail"
                              type="email"
                              value={newTeacher.email}
                              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profSchool">School They Work At</Label>
                            <Input
                              id="profSchool"
                              value={newTeacher.school}
                              onChange={(e) => setNewTeacher({ ...newTeacher, school: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profSchoolYears">School Years They Teach</Label>
                            <Select
                              onValueChange={(value) =>
                                handleMultiSelect(value, newTeacher.schoolYears, (arr) =>
                                  setNewTeacher({ ...newTeacher, schoolYears: arr }),
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select school years" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1AS">1AS</SelectItem>
                                <SelectItem value="2AS">2AS</SelectItem>
                                <SelectItem value="3AS">3AS</SelectItem>
                                <SelectItem value="BEM">BEM</SelectItem>
                                <SelectItem value="BAC">BAC</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {newTeacher.schoolYears.map((year) => (
                                <Badge
                                  key={year}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleMultiSelect(year, newTeacher.schoolYears, (arr) =>
                                      setNewTeacher({ ...newTeacher, schoolYears: arr }),
                                    )
                                  }
                                >
                                  {year} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="profSubjects">Subjects They Teach</Label>
                            <Select
                              onValueChange={(value) =>
                                handleMultiSelect(value, newTeacher.subjects, (arr) =>
                                  setNewTeacher({ ...newTeacher, subjects: arr }),
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select subjects" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mathematics">Mathematics</SelectItem>
                                <SelectItem value="Physics">Physics</SelectItem>
                                <SelectItem value="Chemistry">Chemistry</SelectItem>
                                <SelectItem value="Biology">Biology</SelectItem>
                                <SelectItem value="Arabic">Arabic</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="History">History</SelectItem>
                                <SelectItem value="Geography">Geography</SelectItem>
                                <SelectItem value="Philosophy">Philosophy</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {newTeacher.subjects.map((subject) => (
                                <Badge
                                  key={subject}
                                  variant="default"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleMultiSelect(subject, newTeacher.subjects, (arr) =>
                                      setNewTeacher({ ...newTeacher, subjects: arr }),
                                    )
                                  }
                                >
                                  {subject} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowAddTeacherDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Add Teacher
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>School Years</TableHead>
                      <TableHead>Active Courses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => {
                      const teacherCourses = courses.filter((c) => c.teacherId === teacher.id)
                      return (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => router.push(`/teacher/${teacher.id}`)}
                            >
                              {teacher.name}
                            </Button>
                          </TableCell>
                          <TableCell>
                            {teacher.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1">
                                {subject}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>{teacher.school}</TableCell>
                          <TableCell>
                            {teacher.schoolYears.map((year, idx) => (
                              <Badge key={idx} variant="outline" className="mr-1">
                                {year}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{teacherCourses.length} course(s)</span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
