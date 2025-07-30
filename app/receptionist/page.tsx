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
import { LogOut, UserPlus, Users, DollarSign, Search, GraduationCap } from "lucide-react"

// Mock data
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
    courses: [{ subject: "Mathematics", teacher: "Prof. Salim", timeSlot: "9:00-11:00", paymentStatus: "Paid" }],
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
    courses: [
      { subject: "Physics", teacher: "Prof. Amina", timeSlot: "14:00-16:00", paymentStatus: "Pending" },
      { subject: "Chemistry", teacher: "Prof. Omar", timeSlot: "16:00-18:00", paymentStatus: "Paid" },
    ],
    registrationFeePaid: true,
  },
]

const mockTeachers = [
  { id: 1, name: "Prof. Salim", subjects: ["Mathematics"], percentage: 70, students: 15, payout: 2100, paid: false },
  { id: 2, name: "Prof. Amina", subjects: ["Physics"], percentage: 65, students: 12, payout: 1560, paid: true },
  { id: 3, name: "Prof. Omar", subjects: ["Chemistry"], percentage: 68, students: 18, payout: 2448, paid: false },
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
    percentageCut: 70,
  },
  {
    id: 2,
    name: "Prof. Amina Khelifi",
    address: "321 Avenue de l'Université, Oran",
    phone: "+213 555 333 444",
    email: "amina.khelifi@school.dz",
    schools: ["Lycée Ibn Khaldoun"],
    subjects: ["Physics", "Chemistry"],
    percentageCut: 65,
  },
]

export default function ReceptionistDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState(mockStudents)
  const [teachers, setTeachers] = useState(mockTeachers)
  const [professors, setProfessors] = useState(mockProfessors)
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
    percentageCut: "",
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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const studentResults = students
        .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((student) => ({ ...student, type: "student" }))

      const professorResults = professors
        .filter((professor) => professor.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((professor) => ({ ...professor, type: "professor" }))

      setSearchResults([...studentResults, ...professorResults])
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, students, professors])

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
      courses: [],
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
      percentageCut: Number.parseInt(newProfessor.percentageCut),
    }
    setProfessors([...professors, professor])
    setNewProfessor({
      name: "",
      address: "",
      phone: "",
      email: "",
      schools: "",
      subjects: "",
      percentageCut: "",
    })
  }

  const markTeacherPaid = (teacherId: number) => {
    setTeachers(teachers.map((teacher) => (teacher.id === teacherId ? { ...teacher, paid: true } : teacher)))
  }

  const handleSearchResultClick = (result: any) => {
    if (result.type === "student") {
      router.push(`/student/${result.id}`)
    } else if (result.type === "professor") {
      router.push(`/professor/${result.id}`)
    }
    setSearchQuery("")
    setShowSearchResults(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Receptionist Dashboard</h1>

            {/* Global Search */}
            <div className="flex-1 max-w-md mx-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students or professors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.name}</span>
                        <Badge variant={result.type === "student" ? "default" : "secondary"}>
                          {result.type === "student" ? "Student" : "Professor"}
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
            <TabsTrigger value="register">Registration</TabsTrigger>
            <TabsTrigger value="payments">Teacher Payments</TabsTrigger>
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
                      <TableHead>Courses</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
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
                          {student.courses.map((course, idx) => (
                            <Badge key={idx} variant="secondary" className="mr-1">
                              {course.subject}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>
                          {student.courses.map((course, idx) => (
                            <Badge
                              key={idx}
                              variant={course.paymentStatus === "Paid" ? "default" : "destructive"}
                              className="mr-1"
                            >
                              {course.paymentStatus}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/student/${student.id}`)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unified Registration Tab */}
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
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="profPercentage">Percentage Cut Per Course (%)</Label>
                        <Select
                          value={newProfessor.percentageCut}
                          onValueChange={(value) => setNewProfessor({ ...newProfessor, percentageCut: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select percentage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60">60%</SelectItem>
                            <SelectItem value="65">65%</SelectItem>
                            <SelectItem value="70">70%</SelectItem>
                            <SelectItem value="75">75%</SelectItem>
                            <SelectItem value="80">80%</SelectItem>
                          </SelectContent>
                        </Select>
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

          {/* Teacher Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Teacher Payment Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Calculated Payout</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/professor/${teacher.id}`)}
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
                        <TableCell>{teacher.percentage}%</TableCell>
                        <TableCell>{teacher.students}</TableCell>
                        <TableCell>{teacher.payout} DA</TableCell>
                        <TableCell>
                          <Badge variant={teacher.paid ? "default" : "destructive"}>
                            {teacher.paid ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!teacher.paid && (
                            <Button variant="outline" size="sm" onClick={() => markTeacherPaid(teacher.id)}>
                              Mark as Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
