"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Save, X, GraduationCap, MapPin, Phone, Mail, School, Plus, BookOpen } from "lucide-react"

// Mock professor data with courses
const mockProfessorDetails = {
  1: {
    id: 1,
    name: "Prof. Salim Benali",
    address: "789 Rue des Professeurs, Alger",
    phone: "+213 555 111 222",
    email: "salim.benali@school.dz",
    schools: ["Lycée Mohamed Boudiaf", "Lycée Ibn Sina"],
    subjects: ["Mathematics", "Physics"],
    totalStudents: 15,
    monthlyEarnings: 10500,
    joinDate: "2023-09-01",
    courses: [
      {
        id: 1,
        subject: "Mathematics",
        schoolYear: "3AS",
        percentageCut: 65,
        courseType: "Group",
        pricePerSession: 500,
        duration: 2,
        dayOfWeek: "Monday",
        timeSlot: "9:00-11:00",
      },
      {
        id: 2,
        subject: "Physics",
        schoolYear: "BAC",
        percentageCut: 70,
        courseType: "Individual",
        pricePerSession: 800,
        duration: 1.5,
        dayOfWeek: "Wednesday",
        timeSlot: "14:00-15:30",
      },
    ],
  },
  2: {
    id: 2,
    name: "Prof. Amina Khelifi",
    address: "321 Avenue de l'Université, Oran",
    phone: "+213 555 333 444",
    email: "amina.khelifi@school.dz",
    schools: ["Lycée Ibn Khaldoun"],
    subjects: ["Physics", "Chemistry"],
    totalStudents: 12,
    monthlyEarnings: 7800,
    joinDate: "2023-10-15",
    courses: [
      {
        id: 3,
        subject: "Chemistry",
        schoolYear: "2AS",
        percentageCut: 60,
        courseType: "Group",
        pricePerSession: 450,
        duration: 2,
        dayOfWeek: "Tuesday",
        timeSlot: "16:00-18:00",
      },
    ],
  },
}

export default function ProfessorProfile() {
  const router = useRouter()
  const params = useParams()
  const professorId = params.id as string
  const [professor, setProfessor] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfessor, setEditedProfessor] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [newCourse, setNewCourse] = useState({
    subject: "",
    schoolYear: "",
    percentageCut: 50,
    courseType: "Group",
    pricePerSession: 500,
    duration: 2,
    dayOfWeek: "",
    timeSlot: "",
  })

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))

    // Get professor data
    const professorData = mockProfessorDetails[professorId as keyof typeof mockProfessorDetails]
    if (professorData) {
      setProfessor(professorData)
      setEditedProfessor({ ...professorData })
    } else {
      router.push("/receptionist")
    }
  }, [professorId, router])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setProfessor({ ...editedProfessor })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfessor({ ...professor })
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditedProfessor({ ...editedProfessor, [field]: value })
  }

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault()
    const course = {
      id: professor.courses.length + 1,
      ...newCourse,
    }

    const updatedProfessor = {
      ...professor,
      courses: [...professor.courses, course],
    }

    setProfessor(updatedProfessor)
    setEditedProfessor(updatedProfessor)
    setNewCourse({
      subject: "",
      schoolYear: "",
      percentageCut: 50,
      courseType: "Group",
      pricePerSession: 500,
      duration: 2,
      dayOfWeek: "",
      timeSlot: "",
    })
    setShowAddCourseDialog(false)
  }

  if (!professor || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const canEdit = user.role === "receptionist" || user.role === "manager"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Professor Profile</h1>
            </div>
            {canEdit && (
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Professor Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Professor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedProfessor.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    ) : (
                      <p className="text-lg font-semibold">{professor.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date</Label>
                    <p className="text-gray-600">{professor.joinDate}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>Address</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfessor.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{professor.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <Label>Phone Number</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfessor.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{professor.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <Label>Email</Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedProfessor.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{professor.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <School className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>Schools</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfessor.schools.join(", ")}
                          onChange={(e) => handleInputChange("schools", e.target.value.split(", "))}
                          placeholder="Separate schools with commas"
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {professor.schools.map((school: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {school}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subjects Taught</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfessor.subjects.join(", ")}
                        onChange={(e) => handleInputChange("subjects", e.target.value.split(", "))}
                        placeholder="Separate subjects with commas"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {professor.subjects.map((subject: string, idx: number) => (
                          <Badge key={idx} variant="default">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Taught Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Courses Taught
                  </CardTitle>
                  {canEdit && (
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
                                  <SelectItem value="1AS">1AS</SelectItem>
                                  <SelectItem value="2AS">2AS</SelectItem>
                                  <SelectItem value="3AS">3AS</SelectItem>
                                  <SelectItem value="BEM">BEM</SelectItem>
                                  <SelectItem value="BAC">BAC</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
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
                              <Label htmlFor="pricePerSession">Price per Session (DA)</Label>
                              <Input
                                id="pricePerSession"
                                type="number"
                                value={newCourse.pricePerSession}
                                onChange={(e) =>
                                  setNewCourse({ ...newCourse, pricePerSession: Number.parseInt(e.target.value) })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="duration">Duration (hours)</Label>
                              <Input
                                id="duration"
                                type="number"
                                step="0.5"
                                value={newCourse.duration}
                                onChange={(e) =>
                                  setNewCourse({ ...newCourse, duration: Number.parseFloat(e.target.value) })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dayOfWeek">Day of Week</Label>
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
                              <Label htmlFor="timeSlot">Time Slot</Label>
                              <Input
                                id="timeSlot"
                                placeholder="e.g., 9:00-11:00"
                                value={newCourse.timeSlot}
                                onChange={(e) => setNewCourse({ ...newCourse, timeSlot: e.target.value })}
                                required
                              />
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
                      <TableHead>Subject</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price/Session</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Cut %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professor.courses.map((course: any) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.subject}</TableCell>
                        <TableCell>{course.schoolYear}</TableCell>
                        <TableCell>
                          <Badge variant={course.courseType === "Group" ? "default" : "secondary"}>
                            {course.courseType}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.pricePerSession} DA</TableCell>
                        <TableCell>{course.duration}h</TableCell>
                        <TableCell>
                          {course.dayOfWeek}
                          <br />
                          <span className="text-sm text-gray-600">{course.timeSlot}</span>
                        </TableCell>
                        <TableCell>{course.percentageCut}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{professor.totalStudents}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{professor.monthlyEarnings.toLocaleString()} DA</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-purple-600">{professor.courses.length}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Schools</p>
                  <p className="text-2xl font-bold text-orange-600">{professor.schools.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
