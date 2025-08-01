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
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Edit, Save, X, GraduationCap, MapPin, Phone, Mail, School, Plus, BookOpen } from "lucide-react"
import { teacherService, courseService, paymentService } from "@/src/services/appDataService"

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

const mockCourseInstances = [
  {
    id: 1,
    templateId: 1,
    month: "2024-01",
    studentIds: [1],
    studentNames: ["Ahmed Ben Ali"],
    status: "active",
    payments: { studentPaid: true, profPaid: false },
  },
  {
    id: 2,
    templateId: 3,
    month: "2024-01",
    studentIds: [2],
    studentNames: ["Fatima Zahra"],
    status: "active",
    payments: { studentPaid: false, profPaid: false },
  },
]

export default function ProfessorProfile() {
  const router = useRouter()
  const params = useParams()
  const professorId = params.id as string
  const [professor, setProfessor] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfessor, setEditedProfessor] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [courseTemplates, setCourseTemplates] = useState(mockCourseTemplates)
  const [courseInstances, setCourseInstances] = useState(mockCourseInstances)
  const [newCourse, setNewCourse] = useState({
    subject: "",
    schoolYear: "",
    percentageCut: 50,
    type: "Group",
    price: 500,
    durationHours: 2,
    schedule: "",
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
    const template = {
      id: courseTemplates.length + 1,
      professorId: Number.parseInt(professorId),
      ...newCourse,
    }

    setCourseTemplates([...courseTemplates, template])
    setNewCourse({
      subject: "",
      schoolYear: "",
      percentageCut: 50,
      type: "Group",
      price: 500,
      durationHours: 2,
      schedule: "",
    })
    setShowAddCourseDialog(false)
  }

  const toggleProfPaid = (instanceId: number) => {
    setCourseInstances((instances) =>
      instances.map((instance) => {
        if (instance.id === instanceId) {
          const newPayments = {
            ...instance.payments,
            profPaid: !instance.payments.profPaid,
          }
          const newStatus = newPayments.studentPaid && newPayments.profPaid ? "completed" : "active"
          return {
            ...instance,
            payments: newPayments,
            status: newStatus,
          }
        }
        return instance
      }),
    )
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
  const professorTemplates = courseTemplates.filter((t) => t.professorId === Number.parseInt(professorId))
  const professorInstances = courseInstances.filter((instance) => {
    const template = courseTemplates.find((t) => t.id === instance.templateId)
    return template?.professorId === Number.parseInt(professorId)
  })
  const activeInstances = professorInstances.filter((instance) => instance.status === "active")
  const completedInstances = professorInstances.filter((instance) => instance.status === "completed")

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

            {/* Course Templates Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Course Templates
                  </CardTitle>
                  {canEdit && (
                    <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Course Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Course Template</DialogTitle>
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
                              <Label htmlFor="type">Course Type</Label>
                              <Select
                                value={newCourse.type}
                                onValueChange={(value) => setNewCourse({ ...newCourse, type: value })}
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
                              <Label htmlFor="price">Price per Session (DA)</Label>
                              <Input
                                id="price"
                                type="number"
                                value={newCourse.price}
                                onChange={(e) => setNewCourse({ ...newCourse, price: Number.parseInt(e.target.value) })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="durationHours">Duration (hours)</Label>
                              <Input
                                id="durationHours"
                                type="number"
                                step="0.5"
                                value={newCourse.durationHours}
                                onChange={(e) =>
                                  setNewCourse({ ...newCourse, durationHours: Number.parseFloat(e.target.value) })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="schedule">Schedule</Label>
                              <Input
                                id="schedule"
                                placeholder="e.g., Monday 9:00-11:00 or Flexible"
                                value={newCourse.schedule}
                                onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowAddCourseDialog(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Template</Button>
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
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Cut %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professorTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.subject}</TableCell>
                        <TableCell>{template.schoolYear}</TableCell>
                        <TableCell>
                          <Badge variant={template.type === "Group" ? "default" : "secondary"}>{template.type}</Badge>
                        </TableCell>
                        <TableCell>{template.price} DA</TableCell>
                        <TableCell>{template.durationHours}h</TableCell>
                        <TableCell>{template.schedule}</TableCell>
                        <TableCell>{template.percentageCut}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Course Instances Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Instances & Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Active Instances */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Active Instances</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Month/Date</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Student Paid</TableHead>
                          <TableHead>Prof Paid</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeInstances.map((instance) => {
                          const template = courseTemplates.find((t) => t.id === instance.templateId)
                          return (
                            <TableRow key={instance.id}>
                              <TableCell className="font-medium">
                                {template?.subject} - {template?.schoolYear}
                              </TableCell>
                              <TableCell>
                                <Badge variant={template?.type === "Group" ? "default" : "secondary"}>
                                  {template?.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{instance.month || instance.sessionDate}</TableCell>
                              <TableCell>{instance.studentNames?.join(", ")}</TableCell>
                              <TableCell>
                                <Badge variant={instance.payments.studentPaid ? "default" : "destructive"}>
                                  {instance.payments.studentPaid ? "Paid" : "Pending"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={instance.payments.profPaid}
                                  onCheckedChange={() => toggleProfPaid(instance.id)}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Completed Instances */}
                  {completedInstances.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Completed Instances</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Month/Date</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedInstances.map((instance) => {
                            const template = courseTemplates.find((t) => t.id === instance.templateId)
                            return (
                              <TableRow key={instance.id} className="opacity-60">
                                <TableCell className="font-medium">
                                  {template?.subject} - {template?.schoolYear}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={template?.type === "Group" ? "default" : "secondary"}>
                                    {template?.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{instance.month || instance.sessionDate}</TableCell>
                                <TableCell>{instance.studentNames?.join(", ")}</TableCell>
                                <TableCell>
                                  <Badge variant="default">Completed</Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
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
                  <p className="text-sm text-gray-600">Course Templates</p>
                  <p className="text-2xl font-bold text-purple-600">{professorTemplates.length}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Instances</p>
                  <p className="text-2xl font-bold text-orange-600">{activeInstances.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
