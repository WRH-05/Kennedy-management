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
import { LogOut, UserPlus, BookOpen, Users, DollarSign } from "lucide-react"

// Mock data
const mockStudents = [
  {
    id: 1,
    name: "Ahmed Ben Ali",
    schoolYear: "3AS",
    specialty: "Math",
    courses: [{ subject: "Mathematics", teacher: "Prof. Salim", timeSlot: "9:00-11:00", paymentStatus: "Paid" }],
    registrationFeePaid: true,
  },
  {
    id: 2,
    name: "Fatima Zahra",
    schoolYear: "BAC",
    specialty: "Sciences",
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

export default function ReceptionistDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState(mockStudents)
  const [teachers, setTeachers] = useState(mockTeachers)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)

  // New student form state
  const [newStudent, setNewStudent] = useState({
    name: "",
    schoolYear: "",
    specialty: "",
    subject: "",
    photo: false,
    certificate: false,
    residenceProof: false,
    registrationFeePaid: false,
  })

  // Enrollment form state
  const [enrollment, setEnrollment] = useState({
    studentId: "",
    subject: "",
    schoolYear: "",
    teacher: "",
    timeSlot: "",
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
      courses: [],
      registrationFeePaid: newStudent.registrationFeePaid,
    }
    setStudents([...students, student])
    setNewStudent({
      name: "",
      schoolYear: "",
      specialty: "",
      subject: "",
      photo: false,
      certificate: false,
      residenceProof: false,
      registrationFeePaid: false,
    })
    setShowRegisterForm(false)
  }

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic to enroll student in course
    setShowEnrollForm(false)
  }

  const markTeacherPaid = (teacherId: number) => {
    setTeachers(teachers.map((teacher) => (teacher.id === teacherId ? { ...teacher, paid: true } : teacher)))
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Receptionist Dashboard</h1>
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
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="enroll">Enroll</TabsTrigger>
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
                      <TableHead>Specialty</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.schoolYear}</TableCell>
                        <TableCell>{student.specialty}</TableCell>
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

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register New Student
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={newStudent.subject}
                        onValueChange={(value) => setNewStudent({ ...newStudent, subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>File Checklist</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="photo"
                          checked={newStudent.photo}
                          onCheckedChange={(checked) => setNewStudent({ ...newStudent, photo: checked as boolean })}
                        />
                        <Label htmlFor="photo">Photo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="certificate"
                          checked={newStudent.certificate}
                          onCheckedChange={(checked) =>
                            setNewStudent({ ...newStudent, certificate: checked as boolean })
                          }
                        />
                        <Label htmlFor="certificate">School Certificate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="residenceProof"
                          checked={newStudent.residenceProof}
                          onCheckedChange={(checked) =>
                            setNewStudent({ ...newStudent, residenceProof: checked as boolean })
                          }
                        />
                        <Label htmlFor="residenceProof">Residence Proof</Label>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enroll Tab */}
          <TabsContent value="enroll">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Enroll Student in Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEnrollStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student">Select Student</Label>
                      <Select
                        value={enrollment.studentId}
                        onValueChange={(value) => setEnrollment({ ...enrollment, studentId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={enrollment.subject}
                        onValueChange={(value) => setEnrollment({ ...enrollment, subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher">Teacher</Label>
                      <Select
                        value={enrollment.teacher}
                        onValueChange={(value) => setEnrollment({ ...enrollment, teacher: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.name}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeSlot">Time Slot</Label>
                      <Select
                        value={enrollment.timeSlot}
                        onValueChange={(value) => setEnrollment({ ...enrollment, timeSlot: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8:00-10:00">8:00-10:00</SelectItem>
                          <SelectItem value="10:00-12:00">10:00-12:00</SelectItem>
                          <SelectItem value="14:00-16:00">14:00-16:00</SelectItem>
                          <SelectItem value="16:00-18:00">16:00-18:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Enroll Student
                  </Button>
                </form>
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
                        <TableCell className="font-medium">{teacher.name}</TableCell>
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
