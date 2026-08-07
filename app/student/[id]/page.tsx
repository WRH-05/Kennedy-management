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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Download, User, BookOpen, AlertTriangle, CheckCircle } from "lucide-react"
import { Student, studentService } from "@/services/studentService"
import { Tables, TablesUpdate } from "@/types/database.types"
import { gradeLevelsService } from "@/services/gradeLevelsService"

function StudentDashboardContent() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<Student>()
  const [editedStudent, setEditedStudent] = useState<TablesUpdate<"students">>()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gradeSearchQuery, setGradeSearchQuery] = useState("")
  const [showGradeLevelsResults, setShowGradeLevelsResults] = useState(false)
  const [filteredGradeLevels, setFilteredGradeLevels] = useState<Tables<"grade_levels">[]>([])

  const inputSearch = (name: string) => {
    if (name.length == 0) return
    gradeLevelsService.getAllGradeLevelsByName(name).then((v) => {
      console.log(v)
      setFilteredGradeLevels(v.data);
    })
      .catch((e) => {
        console.error(e);
      })
  }

  useEffect(() => {
    const loadStudentData = async () => {
      setLoading(true)
      try {
        const studentData = await studentService.getStudentById(studentId)
        if (!studentData) router.push('/')
        setStudent(studentData)
        const { grade_levels, ...cleaned } = studentData
        setEditedStudent({
          ...cleaned
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()
  }, [studentId, router])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setShowSaveConfirmation(true)
  }

  const confirmSave = async () => {
    try {
      if (!editedStudent) return
      setLoading(true)
      setError(null)
      const updatedStudent = await studentService.updateStudent(studentId, editedStudent)
      setStudent(updatedStudent)
      setEditedStudent(JSON.parse(JSON.stringify(updatedStudent)))
      setIsEditing(false)
      setShowSaveConfirmation(false)
    } catch (err) {
      console.error("Error updating student:", err)
      setError("Failed to update student")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedStudent(student ? JSON.parse(JSON.stringify(student)) : null)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    if (!editedStudent) return
    setEditedStudent({ ...editedStudent, [field]: value })
  }

  const downloadStudentCard = () => {
    // Student card download functionality would be implemented here
  }

  if (!student || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const studentCourseInstances = student.course_enrollments.flatMap((ce) => ce.course_instances)
  const activeCourses = studentCourseInstances.filter((course) => !course.archived)
  const completedCourses = studentCourseInstances.filter((course) => course.archived)

  const payments = student.student_payments

  const totalMonthlyFees = student.course_enrollments.reduce((sum, ce) => ce.status === "enrolled" ? sum + (ce.course_instances.monthly_price || 0) : sum + 0, 0)
  const paidThisMonth = '?' // Payment tracking to be implemented with payments table

  // Calculate alerts
  const missedPayments = payments.filter((p) => p.status == 'paid').length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
            </div>

            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={handleEdit}>Edit Student</Button>
              ) : (
                <>
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedStudent?.name ?? ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    ) : (
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school_year">School Level</Label>
                    {isEditing ? (
                      <div className="relative">
                        <Input
                          id=";evelSearch"
                          placeholder="Search for a level..."
                          value={gradeSearchQuery}
                          onChange={(e) => {
                            setGradeSearchQuery(e.target.value)
                            setShowGradeLevelsResults(e.target.value.length > 0)
                            inputSearch(e.target.value)
                          }}
                          onBlur={() => setTimeout(() => setShowGradeLevelsResults(false), 150)}
                          onFocus={() => setShowGradeLevelsResults(gradeSearchQuery.length > 0)}
                          required
                        />

                        {showGradeLevelsResults && filteredGradeLevels.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                            {filteredGradeLevels.map((level) => (
                              <div
                                key={level.id}
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                // onMouseDown runs BEFORE onBlur, securing the selection
                                onMouseDown={() => {
                                  handleInputChange('school_level', level.id.toString())
                                  setGradeSearchQuery(level.name)
                                  setShowGradeLevelsResults(false)
                                }}
                              >
                                <div className="font-medium text-sm text-gray-900">{level.name}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">{student.grade_levels.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school">School</Label>
                    {isEditing ? (
                      <>
                        <Input
                          id="school"
                          value={editedStudent?.school ?? ""}
                          onChange={(e) => handleInputChange("school", e.target.value)}
                        />
                      </>
                    ) : (
                      <p className="text-gray-600">{student.school || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Birth Date</Label>
                    {isEditing ? (
                      <Input
                        id="birth_date"
                        value={editedStudent?.birth_date ?? ""}
                        onChange={(e) => handleInputChange("birth_date", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.birth_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedStudent?.phone ?? ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedStudent?.email ?? ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={editedStudent?.address ?? ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600">{student.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Date</Label>
                    <p className="text-gray-600">{student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
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
            <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to save the changes to this student's profile?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmSave}>Save Changes</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Status Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Status Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {missedPayments > 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{missedPayments} course(s) have missed payments</AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>All payments up to date</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

          </div>

          {/* courseInstances */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Active courseInstances */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Active Course Instances</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Monthly Price</TableHead>
                          <TableHead>Payment Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeCourses.map((course) => {
                          const isPaymentMissing = payments.filter((p) => {
                            return p.course_id == course.id && p.status != 'paid'
                          }).length > 1
                          return (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => router.push(`/course-instance/${course.id}`)}
                                >
                                  {course.course_eligibility.courses.name} - {course.course_eligibility.grade_levels?.name}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => router.push(`/teacher/${course.teacher_id}`)}
                                >
                                  {course.teachers.name}
                                </Button>
                              </TableCell>
                              <TableCell>{course.monthly_price} DA</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {isPaymentMissing ? "Missing payment" : "Paid"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Completed courseInstances */}
                  {completedCourses.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Completed courseInstances</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Monthly Price</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedCourses.map((course) => (
                            <TableRow key={course.id} className="opacity-60">
                              <TableCell className="font-medium">
                                {course.course_eligibility.courses.name} - {course.course_eligibility.grade_levels?.name}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => router.push(`/teacher/${course.teacher_id}`)}
                                >
                                  {course.teachers.name}
                                </Button>
                              </TableCell>
                              <TableCell>{course.monthly_price} DA</TableCell>
                              <TableCell>
                                <Badge variant="default">Completed</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
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

export default function StudentDashboard() {
  return (
    <StudentDashboardContent />
  )
}
