"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Save, X, GraduationCap, MapPin, Phone, Mail, School, BookOpen } from "lucide-react"
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
import { DataService } from "@/services/dataService"
import type { Teacher } from "@/mocks/teachers"
import type { Course } from "@/mocks/courses"

export default function TeacherProfile() {
  const router = useRouter()
  const params = useParams()
  const teacherId = params.id as string
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTeacher, setEditedTeacher] = useState<Teacher | null>(null)
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))

    // Get teacher data
    const teacherData = DataService.getTeacherById(Number.parseInt(teacherId))
    if (teacherData) {
      setTeacher(teacherData)
      setEditedTeacher({ ...teacherData })
      setCourses(DataService.getTeacherCourses(Number.parseInt(teacherId)))
    } else {
      router.push("/receptionist")
    }
  }, [teacherId, router])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setShowSaveConfirmation(true)
  }

  const confirmSave = () => {
    if (editedTeacher) {
      setTeacher({ ...editedTeacher })
      DataService.updateTeacher(Number.parseInt(teacherId), editedTeacher)
    }
    setIsEditing(false)
    setShowSaveConfirmation(false)
  }

  const handleCancel = () => {
    setEditedTeacher(teacher ? { ...teacher } : null)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    if (editedTeacher) {
      setEditedTeacher({ ...editedTeacher, [field]: value })
    }
  }

  if (!teacher || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  const canEdit = user.role === "receptionist" || user.role === "manager"
  const activeCourses = courses.filter((course) => course.status === "active")
  const completedCourses = courses.filter((course) => course.status === "completed")

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
              <h1 className="text-xl font-semibold text-gray-900">Teacher Profile</h1>
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
          {/* Teacher Info & Statistics - Left Side */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Teacher Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing && editedTeacher ? (
                      <Input
                        id="name"
                        value={editedTeacher.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    ) : (
                      <p className="text-lg font-semibold">{teacher.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date</Label>
                    <p className="text-gray-600">{teacher.joinDate}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>Address</Label>
                      {isEditing && editedTeacher ? (
                        <Input
                          value={editedTeacher.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{teacher.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <Label>Phone Number</Label>
                      {isEditing && editedTeacher ? (
                        <Input
                          value={editedTeacher.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{teacher.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <Label>Email</Label>
                      {isEditing && editedTeacher ? (
                        <Input
                          type="email"
                          value={editedTeacher.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{teacher.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <School className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>School</Label>
                      {isEditing && editedTeacher ? (
                        <Input
                          value={editedTeacher.school}
                          onChange={(e) => handleInputChange("school", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{teacher.school}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>School Years They Teach</Label>
                    {isEditing && editedTeacher ? (
                      <Input
                        value={editedTeacher.schoolYears?.join(", ") || ""}
                        onChange={(e) => handleInputChange("schoolYears", e.target.value.split(", "))}
                        placeholder="Separate school years with commas"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {teacher.schoolYears?.map((year: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {year}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Subjects Taught</Label>
                    {isEditing && editedTeacher ? (
                      <Input
                        value={editedTeacher.subjects.join(", ")}
                        onChange={(e) => handleInputChange("subjects", e.target.value.split(", "))}
                        placeholder="Separate subjects with commas"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.map((subject: string, idx: number) => (
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

            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{teacher.totalStudents}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{teacher.monthlyEarnings.toLocaleString()} DA</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-purple-600">{activeCourses.length}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed Courses</p>
                  <p className="text-2xl font-bold text-orange-600">{completedCourses.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses - Right Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Information & Payments
                </CardTitle>
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
                          <TableHead>Type</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Teacher Cut</TableHead>
                          <TableHead>Teacher Earnings</TableHead>
                          <TableHead>Payment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeCourses.map((course) => {
                          const teacherEarnings = Math.round(
                            (course.price * course.enrolledStudents.length * course.percentageCut) / 100,
                          )
                          return (
                            <TableRow key={course.id}>
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
                                <Badge variant={course.courseType === "Group" ? "default" : "secondary"}>
                                  {course.courseType}
                                </Badge>
                              </TableCell>
                              <TableCell>{course.schedule}</TableCell>
                              <TableCell>{course.enrolledStudents.length}</TableCell>
                              <TableCell>
                                {course.price} DA {course.courseType === "Group" ? "/month" : "/session"}
                              </TableCell>
                              <TableCell>{course.percentageCut}%</TableCell>
                              <TableCell className="font-semibold text-green-600">{teacherEarnings} DA</TableCell>
                              <TableCell>
                                <Badge variant={course.payments.teacherPaid ? "default" : "destructive"}>
                                  {course.payments.teacherPaid ? "Paid" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Completed Courses */}
                  {completedCourses.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Completed Courses</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Monthly Price</TableHead>
                            <TableHead>Teacher Cut</TableHead>
                            <TableHead>Teacher Earnings</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedCourses.map((course) => {
                            const teacherEarnings = Math.round(
                              (course.monthlyPrice * course.enrolledStudents.length * course.percentageCut) / 100,
                            )
                            return (
                              <TableRow key={course.id} className="opacity-60">
                                <TableCell className="font-medium">
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto font-medium text-left"
                                    onClick={() => router.push(`/course/${course.id}`)}
                                  >
                                    {course.subject} - {course.schoolYear}
                                  </Button>
                                </TableCell>
                                <TableCell>{course.schedule}</TableCell>
                                <TableCell>{course.enrolledStudents.length} students</TableCell>
                                <TableCell>{course.monthlyPrice} DA</TableCell>
                                <TableCell>{course.percentageCut}%</TableCell>
                                <TableCell className="font-semibold">{teacherEarnings} DA</TableCell>
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

      <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save the changes to this teacher's profile?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
