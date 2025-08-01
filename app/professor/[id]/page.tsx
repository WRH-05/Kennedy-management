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

export default function ProfessorProfile() {
  const router = useRouter()
  const params = useParams()
  const professorId = params.id as string
  const [professor, setProfessor] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfessor, setEditedProfessor] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem("user")
        if (!userData) {
          router.push("/")
          return
        }
        setUser(JSON.parse(userData))

        // Load professor data from Supabase
        const professorData = await teacherService.getTeacherById(Number.parseInt(professorId))
        if (professorData) {
          setProfessor(professorData)
          setEditedProfessor({ ...professorData })
        } else {
          setError("Professor not found")
          router.push("/receptionist")
          return
        }

        // Load professor's courses
        const professorCourses = await courseService.getCoursesByTeacherId(Number.parseInt(professorId))
        setCourses(professorCourses)

      } catch (err) {
        setError("Failed to load professor data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [professorId, router])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await teacherService.updateTeacher(Number.parseInt(professorId), editedProfessor)
      setProfessor({ ...editedProfessor })
      setIsEditing(false)
    } catch (err) {
      setError("Failed to update professor")
    }
  }

  const handleCancel = () => {
    setEditedProfessor({ ...professor })
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditedProfessor({ ...editedProfessor, [field]: value })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    )
  }

  if (error || !professor || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">{error || "Professor not found"}</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
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
                    <p className="text-gray-600">{professor.created_at ? new Date(professor.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>Address</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfessor.address || ''}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{professor.address || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <Label>Phone Number</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfessor.phone || ''}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{professor.phone || 'Not provided'}</p>
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
                          value={editedProfessor.email || ''}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{professor.email || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <School className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <Label>School</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfessor.school || ''}
                          onChange={(e) => handleInputChange("school", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-600">{professor.school || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subjects Taught</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfessor.subjects || ''}
                        onChange={(e) => handleInputChange("subjects", e.target.value)}
                        placeholder="Separate subjects with commas"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {professor.subjects ? 
                          professor.subjects.split(',').map((subject: string, idx: number) => (
                            <Badge key={idx} variant="default">
                              {subject.trim()}
                            </Badge>
                          )) : 
                          <p className="text-gray-600">No subjects specified</p>
                        }
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Active Courses */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Active Courses</h3>
                    {activeCourses.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>School Year</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Students</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeCourses.map((course) => (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">{course.subject}</TableCell>
                              <TableCell>{course.school_year}</TableCell>
                              <TableCell>
                                <Badge variant={course.course_type === "Group" ? "default" : "secondary"}>
                                  {course.course_type}
                                </Badge>
                              </TableCell>
                              <TableCell>{course.price} DA</TableCell>
                              <TableCell>{course.schedule || 'Not scheduled'}</TableCell>
                              <TableCell>{course.enrolled_students?.length || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-gray-600">No active courses</p>
                    )}
                  </div>

                  {/* Completed Courses */}
                  {completedCourses.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Completed Courses</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>School Year</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Students</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedCourses.map((course) => (
                            <TableRow key={course.id} className="opacity-60">
                              <TableCell className="font-medium">{course.subject}</TableCell>
                              <TableCell>{course.school_year}</TableCell>
                              <TableCell>
                                <Badge variant={course.course_type === "Group" ? "default" : "secondary"}>
                                  {course.course_type}
                                </Badge>
                              </TableCell>
                              <TableCell>{course.price} DA</TableCell>
                              <TableCell>{course.enrolled_students?.length || 0}</TableCell>
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

          {/* Statistics */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-green-600">{activeCourses.length}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {activeCourses.reduce((total, course) => total + (course.enrolled_students?.length || 0), 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed Courses</p>
                  <p className="text-2xl font-bold text-orange-600">{completedCourses.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
