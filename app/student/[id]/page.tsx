"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Download,
  User,
  BookOpen,
  Plus,
  Upload,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Trash2,
} from "lucide-react"

// Mock data (same structure as receptionist page)
const mockStudentDetails = {
  1: {
    id: 1,
    name: "Ahmed Ben Ali",
    schoolYear: "3AS",
    specialty: "Math",
    address: "123 Rue de la Paix, Alger",
    birthDate: "2005-03-15",
    phone: "+213 555 123 456",
    email: "ahmed.benali@email.com",
    school: "Lycée Mohamed Boudiaf",
    registrationDate: "2024-01-15",
    documents: {
      photos: { uploaded: true, filename: "20240115_Ben_Ahmed_Photos.pdf" },
      copyOfId: { uploaded: false, filename: null },
      registrationForm: { uploaded: true, filename: "20240115_Ben_Ahmed_Registration.pdf" },
    },
  },
  2: {
    id: 2,
    name: "Fatima Zahra",
    schoolYear: "BAC",
    specialty: "Sciences",
    address: "456 Avenue Mohamed V, Oran",
    birthDate: "2004-07-22",
    phone: "+213 555 789 012",
    email: "fatima.zahra@email.com",
    school: "Lycée Ibn Khaldoun",
    registrationDate: "2024-01-10",
    documents: {
      photos: { uploaded: true, filename: "20240110_Zahra_Fatima_Photos.pdf" },
      copyOfId: { uploaded: true, filename: "20240110_Zahra_Fatima_ID.pdf" },
      registrationForm: { uploaded: false, filename: null },
    },
  },
}

const mockCourseTemplates = [
  {
    id: 1,
    professorId: 1,
    professorName: "Prof. Salim",
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
    professorName: "Prof. Salim",
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
    professorName: "Prof. Amina",
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

export default function StudentDashboard() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<any>(null)
  const [courseInstances, setCourseInstances] = useState(mockCourseInstances)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [showBookSessionDialog, setShowBookSessionDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedSessionTemplate, setSelectedSessionTemplate] = useState("")
  const [sessionDate, setSessionDate] = useState("")
  const [uploadingDoc, setUploadingDoc] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    // Get student data
    const studentData = mockStudentDetails[studentId as keyof typeof mockStudentDetails]
    if (studentData) {
      setStudent(studentData)
    } else {
      router.push("/receptionist")
    }
  }, [studentId, router])

  const togglePayment = (instanceId: number, paymentType: "studentPaid" | "profPaid") => {
    setCourseInstances((instances) =>
      instances.map((instance) => {
        if (instance.id === instanceId) {
          const newPayments = {
            ...instance.payments,
            [paymentType]: !instance.payments[paymentType],
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

  const removeStudentFromCourse = (instanceId: number) => {
    setCourseInstances((instances) =>
      instances
        .map((instance) => {
          if (instance.id === instanceId) {
            return {
              ...instance,
              studentIds: instance.studentIds.filter((id) => id !== Number.parseInt(studentId)),
            }
          }
          return instance
        })
        .filter((instance) => instance.studentIds.length > 0),
    )
  }

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!student || !selectedCourse) return

    const template = mockCourseTemplates.find((t) => t.id.toString() === selectedCourse)
    if (!template || template.type !== "Group") return

    const newInstance = {
      id: courseInstances.length + 1,
      templateId: template.id,
      month: "2024-01",
      studentIds: [Number.parseInt(studentId)],
      status: "active",
      payments: { studentPaid: false, profPaid: false },
    }

    setCourseInstances([...courseInstances, newInstance])
    setSelectedCourse("")
    setShowAddCourseDialog(false)
  }

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!student || !selectedSessionTemplate || !sessionDate) return

    const template = mockCourseTemplates.find((t) => t.id.toString() === selectedSessionTemplate)
    if (!template || template.type !== "Individual") return

    const newInstance = {
      id: courseInstances.length + 1,
      templateId: template.id,
      sessionDate: sessionDate,
      studentIds: [Number.parseInt(studentId)],
      status: "active",
      payments: { studentPaid: false, profPaid: false },
    }

    setCourseInstances([...courseInstances, newInstance])
    setSelectedSessionTemplate("")
    setSessionDate("")
    setShowBookSessionDialog(false)
  }

  const handleFileUpload = (docType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed")
      return
    }

    // Validate filename format (YYYYMMDD_Last_First_DocType.pdf)
    const filenameRegex = /^\d{8}_[A-Za-z]+_[A-Za-z]+_[A-Za-z]+\.pdf$/
    if (!filenameRegex.test(file.name)) {
      alert("Filename must follow format: YYYYMMDD_Last_First_DocType.pdf")
      return
    }

    // Simulate upload
    setUploadingDoc(docType)
    setTimeout(() => {
      const updatedStudent = {
        ...student,
        documents: {
          ...student.documents,
          [docType]: {
            uploaded: true,
            filename: file.name,
          },
        },
      }
      setStudent(updatedStudent)
      setUploadingDoc("")
    }, 1000)
  }

  const downloadStudentCard = () => {
    alert("Student card download would be implemented here")
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const studentInstances = courseInstances.filter((instance) =>
    instance.studentIds.includes(Number.parseInt(studentId)),
  )
  const activeInstances = studentInstances.filter((instance) => instance.status === "active")
  const completedInstances = studentInstances.filter((instance) => instance.status === "completed")

  const totalMonthlyFees = activeInstances.reduce((sum, instance) => {
    const template = mockCourseTemplates.find((t) => t.id === instance.templateId)
    return sum + (template?.price || 0)
  }, 0)

  const paidThisMonth = activeInstances.reduce((sum, instance) => {
    const template = mockCourseTemplates.find((t) => t.id === instance.templateId)
    return sum + (instance.payments.studentPaid ? template?.price || 0 : 0)
  }, 0)

  // Calculate alerts
  const missedPayments = activeInstances.filter((instance) => !instance.payments.studentPaid).length
  const missingDocuments = Object.entries(student.documents)
    .filter(([_, doc]: [string, any]) => !doc.uploaded)
    .map(([docType, _]) => docType)

  // Filter available group courses
  const enrolledTemplateIds = studentInstances.map((instance) => instance.templateId)
  const availableGroupCourses = mockCourseTemplates.filter(
    (template) => template.type === "Group" && !enrolledTemplateIds.includes(template.id),
  )

  const availableIndividualCourses = mockCourseTemplates.filter((template) => template.type === "Individual")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-gray-600">
                    {student.schoolYear} - {student.specialty}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">School:</span> {student.school}
                  </p>
                  <p>
                    <span className="font-medium">Birth Date:</span> {student.birthDate}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {student.phone}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {student.email}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {student.address}
                  </p>
                  <p>
                    <span className="font-medium">Registration Date:</span> {student.registrationDate}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Monthly Fees:</span>
                    <span className="text-lg font-bold">{totalMonthlyFees.toLocaleString()} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Paid This Month:</span>
                    <span className="text-lg font-bold text-green-600">{paidThisMonth.toLocaleString()} DA</span>
                  </div>
                </div>
                <Button onClick={downloadStudentCard} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Student Card
                </Button>
              </CardContent>
            </Card>

            {/* Status Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Status Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {missedPayments > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{missedPayments} course(s) have missed payments</AlertDescription>
                  </Alert>
                )}
                {missingDocuments.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Missing documents: {missingDocuments.join(", ")}</AlertDescription>
                  </Alert>
                )}
                {missedPayments === 0 && missingDocuments.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>All payments up to date and documents complete</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Documents Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Documents Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Upload PDF files only. Filename format: YYYYMMDD_Last_First_DocType.pdf
                </div>

                {Object.entries(student.documents).map(([docType, doc]: [string, any]) => (
                  <div key={docType} className="space-y-2">
                    <Label className="capitalize">{docType.replace(/([A-Z])/g, " $1").trim()}</Label>
                    <div className="flex items-center space-x-2">
                      {doc.uploaded ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">{doc.filename}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload(docType, e)}
                            disabled={uploadingDoc === docType}
                            className="text-sm"
                          />
                          {uploadingDoc === docType && <span className="text-sm text-blue-600">Uploading...</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Courses and Payments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Course Enrollments
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
                      <DialogTrigger asChild>
                        <Button disabled={availableGroupCourses.length === 0}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Group Course</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCourse} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="course">Available Group Courses</Label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableGroupCourses.map((template) => (
                                  <SelectItem key={template.id} value={template.id.toString()}>
                                    {template.subject} - {template.professorName} ({template.schoolYear}) -{" "}
                                    {template.schedule}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {selectedCourse && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              {(() => {
                                const template = availableGroupCourses.find((t) => t.id.toString() === selectedCourse)
                                return template ? (
                                  <div className="space-y-2">
                                    <p>
                                      <span className="font-medium">Subject:</span> {template.subject}
                                    </p>
                                    <p>
                                      <span className="font-medium">Professor:</span> {template.professorName}
                                    </p>
                                    <p>
                                      <span className="font-medium">School Year:</span> {template.schoolYear}
                                    </p>
                                    <p>
                                      <span className="font-medium">Schedule:</span> {template.schedule}
                                    </p>
                                    <p>
                                      <span className="font-medium">Price:</span> {template.price} DA
                                    </p>
                                    <p>
                                      <span className="font-medium">Duration:</span> {template.durationHours}h
                                    </p>
                                  </div>
                                ) : null
                              })()}
                            </div>
                          )}
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowAddCourseDialog(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Course</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showBookSessionDialog} onOpenChange={setShowBookSessionDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" disabled={availableIndividualCourses.length === 0}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Individual Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book Individual Session</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleBookSession} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="sessionTemplate">Available Individual Sessions</Label>
                            <Select value={selectedSessionTemplate} onValueChange={setSelectedSessionTemplate} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a session type" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableIndividualCourses.map((template) => (
                                  <SelectItem key={template.id} value={template.id.toString()}>
                                    {template.subject} - {template.professorName} ({template.price} DA)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sessionDate">Session Date</Label>
                            <Input
                              id="sessionDate"
                              type="date"
                              value={sessionDate}
                              onChange={(e) => setSessionDate(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowBookSessionDialog(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Book Session</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Active Courses */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Active Courses</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Professor</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Schedule/Date</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Student Paid</TableHead>
                          <TableHead>Prof Paid</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeInstances.map((instance) => {
                          const template = mockCourseTemplates.find((t) => t.id === instance.templateId)
                          return (
                            <TableRow key={instance.id}>
                              <TableCell className="font-medium">
                                {template?.subject} - {template?.schoolYear}
                              </TableCell>
                              <TableCell>{template?.professorName}</TableCell>
                              <TableCell>
                                <Badge variant={template?.type === "Group" ? "default" : "secondary"}>
                                  {template?.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{instance.month || instance.sessionDate}</TableCell>
                              <TableCell>{template?.price} DA</TableCell>
                              <TableCell>
                                <Switch
                                  checked={instance.payments.studentPaid}
                                  onCheckedChange={() => togglePayment(instance.id, "studentPaid")}
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={instance.payments.profPaid}
                                  onCheckedChange={() => togglePayment(instance.id, "profPaid")}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeStudentFromCourse(instance.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Completed Courses */}
                  {completedInstances.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Completed Courses</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Professor</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Schedule/Date</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedInstances.map((instance) => {
                            const template = mockCourseTemplates.find((t) => t.id === instance.templateId)
                            return (
                              <TableRow key={instance.id} className="opacity-60">
                                <TableCell className="font-medium">
                                  {template?.subject} - {template?.schoolYear}
                                </TableCell>
                                <TableCell>{template?.professorName}</TableCell>
                                <TableCell>
                                  <Badge variant={template?.type === "Group" ? "default" : "secondary"}>
                                    {template?.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{instance.month || instance.sessionDate}</TableCell>
                                <TableCell>{template?.price} DA</TableCell>
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
        </div>
      </div>
    </div>
  )
}
