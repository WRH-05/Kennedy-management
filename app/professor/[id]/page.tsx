"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit, Save, X, GraduationCap, MapPin, Phone, Mail, School } from "lucide-react"
import { DataService } from "@/services/dataService"
import type { Teacher } from "@/mocks/teachers"
import type { Course } from "@/mocks/courses"

export default function ProfessorProfile() {
  const router = useRouter()
  const params = useParams()
  const professorId = params.id as string
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

    // Get teacher data (using same data as teacher profile)
    const teacherData = DataService.getTeacherById(Number.parseInt(professorId))
    if (teacherData) {
      setTeacher(teacherData)
      setEditedTeacher({ ...teacherData })
      setCourses(DataService.getTeacherCourses(Number.parseInt(professorId)))
    } else {
      router.push("/manager")
    }
  }, [professorId, router])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setShowSaveConfirmation(true)
  }

  const confirmSave = () => {
    if (editedTeacher) {
      setTeacher({ ...editedTeacher })
      DataService.updateTeacher(Number.parseInt(professorId), editedTeacher)
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
          {/* Teacher Info & Statistics - Left Side */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Professor Information
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
                        onChange={(e) =>\
