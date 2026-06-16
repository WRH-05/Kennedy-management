"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Plus, Archive, MoreHorizontal, Pencil } from "lucide-react"
import { studentService } from "@/services/studentService"
import { archiveService } from "@/services/archiveService"
import { useToast } from "@/hooks/use-toast"
import { TablesInsert } from "@/types/database.types"

interface StudentsTabProps {
  students: any[]
  courses: any[]
  onStudentsUpdate: (students: any[]) => void
  canAdd?: boolean
  showCourses?: boolean
  showPaymentStatus?: boolean
  pendingArchiveIds?: Set<string>
}

export default function StudentsTab({ 
  students, 
  courses, 
  onStudentsUpdate, 
  canAdd = false,
  showCourses = true,
  showPaymentStatus = true,
  pendingArchiveIds = new Set()
}: StudentsTabProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  type Student = {
    name: string,
    schoolLevel: string,
    schoolYear: string,
    specialty: string | null,
    address: string,
    birth_date: string,
    phone: string,
    email: string,
    photos: boolean,
    copyOfId: boolean,
    registrationForm: boolean,
    registration_fee_paid: boolean,
  }
  
  const [newStudent, setNewStudent] = useState<TablesInsert<"students">>({
    name: "",
    school_level: "",
    school_year: "",
    specialty: null,
    address: "",
    birth_date: "",
    phone: "",
    email: "",
    registration_fee_paid: false,
  })

  // School years based on Algerian education system (years.json)
  const schoolYearOptions = {
    primary: [
      { code: "1 AP", name: "1st Year Primary" },
      { code: "2 AP", name: "2nd Year Primary" },
      { code: "3 AP", name: "3rd Year Primary" },
      { code: "4 AP", name: "4th Year Primary" },
      { code: "5 AP", name: "5th Year Primary" },
    ],
    middle: [
      { code: "1 AM", name: "1st Year Middle" },
      { code: "2 AM", name: "2nd Year Middle" },
      { code: "3 AM", name: "3rd Year Middle" },
      { code: "4 AM", name: "4th Year Middle (BEM)" },
    ],
    secondary: [
      { code: "1 AS", name: "1st Year Secondary" },
      { code: "2 AS", name: "2nd Year Secondary" },
      { code: "3 AS", name: "3rd Year Secondary (BAC)" },
    ],
  }

  // Specialty options based on school year for secondary level
  const getSpecialtyOptions = (schoolYear: string) => {
    if (schoolYear === "1 AS") {
      return [
        { code: "1 AS", name: "Common Core Sciences and Technology" },
        { code: "1 AL", name: "Common Core Arts and Letters" },
      ]
    }
    if (schoolYear === "2 AS" || schoolYear === "3 AS") {
      return [
        // Science Stream
        { code: schoolYear === "2 AS" ? "2 AS" : "3 AS", name: "Experimental Sciences" },
        { code: schoolYear === "2 AS" ? "2 MA" : "3 MA", name: "Mathematics" },
        { code: schoolYear === "2 AS" ? "2 MT" : "3 MT", name: "Technical Mathematical" },
        { code: schoolYear === "2 AS" ? "2 GE" : "3 GE", name: "Management and Economy" },
        // Arts Stream
        { code: schoolYear === "2 AS" ? "2 LT" : "3 LT", name: "Literature and Philosophy" },
        { code: schoolYear === "2 AS" ? "2 LE" : "3 LE", name: "Foreign Languages" },
      ]
    }
    return []
  }

  // Handle school level change - reset dependent fields
  const handleSchoolLevelChange = (level: string) => {
    setNewStudent({
      ...newStudent,
      school_level: level,
      school_year: "",
      specialty: null,
    })
  }

  // Handle school year change - reset specialty if needed
  const handleSchoolYearChange = (year: string) => {
    setNewStudent({
      ...newStudent,
      school_year: year,
      specialty: null,
    })
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return // Prevent double submission
    
    setIsSubmitting(true)
    try {
      console.log("Adding student:", newStudent)
      const student = {
        name: newStudent.name,
        school_level: newStudent.school_level,
        school_year: newStudent.school_year,
        specialty: newStudent.specialty,
        address: newStudent.address,
        birth_date: newStudent.birth_date,
        phone: newStudent.phone,
        email: newStudent.email,
        registration_fee_paid: newStudent.registration_fee_paid,
      }
      console.log("Student object to add:", student)
      await studentService.addStudent(student)
      console.log("Student added successfully")
      const updatedStudents = await studentService.getAllStudents()
      onStudentsUpdate(updatedStudents)
      setNewStudent({
        name: "",
        schoolLevel: "",
        schoolYear: "",
        specialty: null,
        address: "",
        birth_date: "",
        phone: "",
        email: "",
        photos: false,
        copyOfId: false,
        registrationForm: false,
        registration_fee_paid: false,
      })
      setShowAddStudentDialog(false)
      toast({
        title: "Student added",
        description: `${student.name} has been successfully added.`,
      })
    } catch (error) {
      console.error("Error adding student:", error)
      toast({
        title: "Error",
        description: "Failed to add student: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveStudent = async (studentId: number, studentName: string) => {
    try {
      // Create archive request in database
      await archiveService.createArchiveRequest('student', studentId, studentName)
      
      // Show visual feedback (request created, will be processed by manager)
      toast({
        title: "Archive request submitted",
        description: "Waiting for manager approval.",
      })
    } catch (error) {
      console.error('Error creating archive request:', error)
      toast({
        title: "Error",
        description: "Failed to create archive request.",
        variant: "destructive",
      })
    }
  }

  const getStudentCourses = (studentId: number) => {
    return courses.filter((course) => course.student_ids?.includes(studentId))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Student List
          </CardTitle>
          {canAdd && (
            <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolLevel">School Level</Label>
                      <Select
                        value={newStudent.schoolLevel}
                        onValueChange={handleSchoolLevelChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select school level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary (Elementary)</SelectItem>
                          <SelectItem value="middle">Middle School</SelectItem>
                          <SelectItem value="secondary">Secondary (High School)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolYear">School Year</Label>
                      <Select
                        value={newStudent.schoolYear}
                        onValueChange={handleSchoolYearChange}
                        disabled={!newStudent.schoolLevel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={newStudent.schoolLevel ? "Select school year" : "Select level first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {newStudent.schoolLevel && schoolYearOptions[newStudent.schoolLevel as keyof typeof schoolYearOptions]?.map((year) => (
                            <SelectItem key={year.code} value={year.code}>
                              {year.code} - {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newStudent.schoolLevel === "secondary" && newStudent.schoolYear && (
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Specialty/Stream</Label>
                        <Select
                          value={newStudent.specialty || undefined}
                          onValueChange={(value) => setNewStudent({ ...newStudent, specialty: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            {getSpecialtyOptions(newStudent.schoolYear).map((spec) => (
                              <SelectItem key={spec.code} value={spec.code}>
                                {spec.code} - {spec.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
                        id="birth_date"
                        type="date"
                        value={newStudent.birth_date}
                        onChange={(e) => setNewStudent({ ...newStudent, birth_date: e.target.value })}
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
                  </div>

                  <div className="space-y-4">
                    <Label>Document Checklist</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="photos"
                          checked={newStudent.photos}
                          onCheckedChange={(checked) =>
                            setNewStudent({ ...newStudent, photos: checked as boolean })
                          }
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
                      checked={newStudent.registration_fee_paid}
                      onCheckedChange={(checked) =>
                        setNewStudent({ ...newStudent, registration_fee_paid: checked as boolean })
                      }
                    />
                    <Label htmlFor="registrationFee">Registration Fee Paid</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Student"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-113.75 overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>School Year</TableHead>
                <TableHead>Specialty</TableHead>
                {showCourses && <TableHead>Enrolled Courses</TableHead>}
                {showPaymentStatus && <TableHead>Payment Status</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const studentCourses = getStudentCourses(student.id)
                return (
                  <TableRow key={student.id} className="group">
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/student/${student.id}`)}
                      >
                        {student.name}
                      </Button>
                    </TableCell>
                    <TableCell className="capitalize">{student.school_level || "-"}</TableCell>
                    <TableCell>{student.school_year}</TableCell>
                    <TableCell>{student.specialty || "-"}</TableCell>
                    {showCourses && (
                      <TableCell>
                        {studentCourses.map((course, idx) => (
                          <Badge key={idx} variant="secondary" className="mr-1">
                            {course.subject}
                          </Badge>
                        ))}
                      </TableCell>
                    )}
                    {showPaymentStatus && (
                      <TableCell>
                        <div className="flex items-center justify-between">
                          <div>
                            {studentCourses.map((course, idx) => (
                              <Badge
                                key={idx}
                                variant={course.payments?.students?.[student.id] ? "default" : "destructive"}
                                className="mr-1"
                              >
                                {course.payments?.students?.[student.id] ? "Paid" : "Pending"}
                              </Badge>
                            ))}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/student/${student.id}`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleArchiveStudent(student.id, student.name)}
                                className={pendingArchiveIds.has(student.id) ? "text-gray-400 cursor-not-allowed" : "text-orange-600"}
                                disabled={pendingArchiveIds.has(student.id)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                {pendingArchiveIds.has(student.id) ? "Archive Pending" : "Archive"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    )}
                    {!showPaymentStatus && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/student/${student.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleArchiveStudent(student.id, student.name)}
                              className={pendingArchiveIds.has(student.id) ? "text-gray-400 cursor-not-allowed" : "text-orange-600"}
                              disabled={pendingArchiveIds.has(student.id)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {pendingArchiveIds.has(student.id) ? "Archive Pending" : "Archive"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
