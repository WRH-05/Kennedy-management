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
import { LogOut, UserPlus, Users, Search, GraduationCap, BookOpen } from "lucide-react"

// Mock data with new structure
const mockStudents = [
  {
    id: 1,
    name: "Ahmed Ben Ali",
    schoolYear: "3AS",
    specialty: "Math",
    address: "123 Rue de la Paix, Alger",
    birthDate: "2005-03-15",
    phone: "+213 555 123 456",
    email: "ahmed.benali@email.com",
    school: "Lycée Mohamed Boudiaf",
    registrationFeePaid: true,
  },
  {
    id: 2,
    name: "Fatima Zahra",
    schoolYear: "BAC",
    specialty: "Sciences",
    address: "456 Avenue Mohamed V, Oran",
    birthDate: "2004-07-22",
    phone: "+213 555 789 012",
    email: "fatima.zahra@email.com",
    school: "Lycée Ibn Khaldoun",
    registrationFeePaid: true,
  },
]

const mockProfessors = [
  {
    id: 1,
    name: "Prof. Salim Benali",
    address: "789 Rue des Professeurs, Alger",
    phone: "+213 555 111 222",
    email: "salim.benali@school.dz",
    schools: ["Lycée Mohamed Boudiaf", "Lycée Ibn Sina"],
    subjects: ["Mathematics", "Physics"],
  },
  {
    id: 2,
    name: "Prof. Amina Khelifi",
    address: "321 Avenue de l'Université, Oran",
    phone: "+213 555 333 444",
    email: "amina.khelifi@school.dz",
    schools: ["Lycée Ibn Khaldoun"],
    subjects: ["Physics", "Chemistry"],
  },
]

// Course Templates
const mockCourseTemplates = [
  {
    id: 1,
    professorId: 1,
    subject: "Mathematics",
    type: "Group",
    percentageCut: 65,
    price: 500,
    durationHours: 2,
    schedule: "Monday 9:00-11:00",
    schoolYear: "3AS",
  },
  {
    id: 2,
    professorId: 1,
    subject: "Physics",
    type: "Individual",
    percentageCut: 70,
    price: 800,
    durationHours: 1.5,
    schedule: "Flexible",
    schoolYear: "BAC",
  },
  {
    id: 3,
    professorId: 2,
    subject: "Chemistry",
    type: "Group",
    percentageCut: 60,
    price: 450,
    durationHours: 2,
    schedule: "Tuesday 16:00-18:00",
    schoolYear: "2AS",
  },
]

// Course Instances
const mockCourseInstances = [
  {
    id: 1,
    templateId: 1,
    month: "2024-01",
    studentIds: [1],
    status: "active",
    payments: { studentPaid: true, profPaid: false },
  },
  {
    id: 2,
    templateId: 3,
    month: "2024-01",
    studentIds: [2],
    status: "active",
    payments: { studentPaid: false, profPaid: false },
  },
]

export default function ReceptionistDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState(mockStudents)
  const [professors, setProfessors] = useState(mockProfessors)
  const [courseTemplates, setCourseTemplates] = useState(mockCourseTemplates)
  const [courseInstances, setCourseInstances] = useState(mockCourseInstances)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [registrationType, setRegistrationType] = useState("student")

  // New student form state
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

  // New professor form state
  const [newProfessor, setNewProfessor] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    schools: "",
    subjects: "",
  })

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

  // Enhanced search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const studentResults = students
        .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((student) => ({ ...student, type: "student" }))

      const professorResults = professors
        .filter((professor) => professor.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((professor) => ({ ...professor, type: "professor" }))

      const courseResults = courseTemplates
        .filter(
          (course) =>
            course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.schoolYear.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((course) => ({
          ...course,
          type: "course",
          professorName: professors.find((p) => p.id === course.professorId)?.name,
        }))

      setSearchResults([...studentResults, ...professorResults, ...courseResults])
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, students, professors, courseTemplates])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault()
    const student = {
      id: students.length + 1,
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
    setStudents([...students, student])
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
  }

  const handleRegisterProfessor = (e: React.FormEvent) => {
    e.preventDefault()
    const professor = {
      id: professors.length + 1,
      name: newProfessor.name,
      address: newProfessor.address,
      phone: newProfessor.phone,
      email: newProfessor.email,
      schools: newProfessor.schools.split(",").map((s) => s.trim()),
      subjects: newProfessor.subjects.split(",").map((s) => s.trim()),
    }
    setProfessors([...professors, professor])
    setNewProfessor({
      name: "",
      address: "",
      phone: "",
      email: "",
      schools: "",
      subjects: "",
    })
  }

  const handleSearchResultClick = (result: any) => {
    if (result.type === "student") {
      router.push(`/student/${result.id}`)
    } else if (result.type === "professor") {
      router.push(`/professor/${result.id}`)
    } else if (result.type === "course") {
      router.push(`/course/${result.id}`)
    }
    setSearchQuery("")
    setShowSearchResults(false)
  }

  const getStudentCourseInstances = (studentId: number) => {
    return courseInstances.filter((instance) => instance.studentIds.includes(studentId))
  }

  if (!user) return null

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
                  placeholder="Search students, professors, courses..."
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
                            result.type === "student"
                              ? "default"
                              : result.type === "professor"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {result.type === "student" ? "Student" : result.type === "professor" ? "Professor" : "Course"}
                        </Badge>
                      </div>
                      {result.type === "student" && (
                        <p className="text-sm text-gray-600">
                          {result.schoolYear} - {result.school}
                        </p>
                      )}
                      {result.type === "professor" && (
                        <p className="text-sm text-gray-600">{result.subjects?.join(", ")}</p>
                      )}
                      {result.type === "course" && (
                        <p className="text-sm text-gray-600">
                          {result.professorName} - {result.schoolYear} - {result.type}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="register">Registration</TabsTrigger>
            <TabsTrigger value="professors">Professors</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Student List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Active Courses</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const studentInstances = getStudentCourseInstances(student.id)
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
                          <TableCell>{student.school}</TableCell>
                          <TableCell>
                            {studentInstances.map((instance, idx) => {
                              const template = courseTemplates.find((t) => t.id === instance.templateId)
                              return template ? (
                                <Badge key={idx} variant="secondary" className="mr-1">
                                  {template.subject}
                                </Badge>
                              ) : null
                            })}
                          </TableCell>
                          <TableCell>
                            {studentInstances.map((instance, idx) => (
                              <Badge
                                key={idx}
                                variant={instance.payments.studentPaid ? "default" : "destructive"}
                                className="mr-1"
                              >
                                {instance.payments.studentPaid ? "Paid" : "Pending"}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/student/${student.id}`)}>
                              View Details
                            </Button>
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
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  All Course Instances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Professor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Month/Date</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Payments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseInstances.map((instance) => {
                      const template = courseTemplates.find((t) => t.id === instance.templateId)
                      const professor = professors.find((p) => p.id === template?.professorId)
                      const enrolledStudents = students.filter((s) => instance.studentIds.includes(s.id))

                      return (
                        <TableRow key={instance.id}>
                          <TableCell>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                instance.status === "active" ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {template?.subject} - {template?.schoolYear}
                          </TableCell>
                          <TableCell>{professor?.name}</TableCell>
                          <TableCell>
                            <Badge variant={template?.type === "Group" ? "default" : "secondary"}>
                              {template?.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{instance.month || instance.sessionDate}</TableCell>
                          <TableCell>{enrolledStudents.map((student) => student.name).join(", ")}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Badge variant={instance.payments.studentPaid ? "default" : "destructive"}>
                                Student: {instance.payments.studentPaid ? "Paid" : "Pending"}
                              </Badge>
                              <Badge variant={instance.payments.profPaid ? "default" : "destructive"}>
                                Prof: {instance.payments.profPaid ? "Paid" : "Pending"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/course/${instance.id}`)}>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registration Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Registration Type Toggle */}
                <div className="mb-6">
                  <Label className="text-base font-medium">Registration Type</Label>
                  <Select value={registrationType} onValueChange={setRegistrationType}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student Registration</SelectItem>
                      <SelectItem value="professor">Professor Registration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Registration Form */}
                {registrationType === "student" && (
                  <form onSubmit={handleRegisterStudent} className="space-y-4">
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
                            onCheckedChange={(checked) => setNewStudent({ ...newStudent, photos: checked as boolean })}
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

                    <Button type="submit" className="w-full">
                      Register Student
                    </Button>
                  </form>
                )}

                {/* Professor Registration Form */}
                {registrationType === "professor" && (
                  <form onSubmit={handleRegisterProfessor} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profName">Full Name</Label>
                        <Input
                          id="profName"
                          value={newProfessor.name}
                          onChange={(e) => setNewProfessor({ ...newProfessor, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profAddress">Address</Label>
                        <Input
                          id="profAddress"
                          value={newProfessor.address}
                          onChange={(e) => setNewProfessor({ ...newProfessor, address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profPhone">Phone Number</Label>
                        <Input
                          id="profPhone"
                          value={newProfessor.phone}
                          onChange={(e) => setNewProfessor({ ...newProfessor, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profEmail">Email</Label>
                        <Input
                          id="profEmail"
                          type="email"
                          value={newProfessor.email}
                          onChange={(e) => setNewProfessor({ ...newProfessor, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profSchools">Schools They Work At</Label>
                        <Input
                          id="profSchools"
                          value={newProfessor.schools}
                          onChange={(e) => setNewProfessor({ ...newProfessor, schools: e.target.value })}
                          placeholder="Separate multiple schools with commas"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profSubjects">Courses/Subjects They Teach</Label>
                        <Input
                          id="profSubjects"
                          value={newProfessor.subjects}
                          onChange={(e) => setNewProfessor({ ...newProfessor, subjects: e.target.value })}
                          placeholder="Separate multiple subjects with commas"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Register Professor
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professors Tab */}
          <TabsContent value="professors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Professor List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Schools</TableHead>
                      <TableHead>Course Templates</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professors.map((professor) => {
                      const professorTemplates = courseTemplates.filter((t) => t.professorId === professor.id)
                      return (
                        <TableRow key={professor.id}>
                          <TableCell className="font-medium">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => router.push(`/professor/${professor.id}`)}
                            >
                              {professor.name}
                            </Button>
                          </TableCell>
                          <TableCell>
                            {professor.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1">
                                {subject}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            {professor.schools.map((school, idx) => (
                              <Badge key={idx} variant="outline" className="mr-1">
                                {school}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{professorTemplates.length} template(s)</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/professor/${professor.id}`)}
                            >
                              View Profile
                            </Button>
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
