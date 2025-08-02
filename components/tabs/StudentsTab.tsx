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
import { Users, Plus, Archive } from "lucide-react"
import { studentService } from "@/services/appDataService"

interface StudentsTabProps {
  students: any[]
  courses: any[]
  onStudentsUpdate: (students: any[]) => void
  canAdd?: boolean
  showCourses?: boolean
  showPaymentStatus?: boolean
}

export default function StudentsTab({ 
  students, 
  courses, 
  onStudentsUpdate, 
  canAdd = false,
  showCourses = true,
  showPaymentStatus = true
}: StudentsTabProps) {
  const router = useRouter()
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    schoolYear: "",
    specialty: "",
    address: "",
    birth_date: "",
    phone: "",
    email: "",
    school: "",
    photos: false,
    copyOfId: false,
    registrationForm: false,
    registrationFeePaid: false,
  })

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Adding student:", newStudent)
      const student = {
        name: newStudent.name,
        school_year: newStudent.schoolYear,
        specialty: newStudent.specialty,
        address: newStudent.address,
        birth_date: newStudent.birth_date,
        phone: newStudent.phone,
        email: newStudent.email,
        school: newStudent.school,
        registrationFeePaid: newStudent.registrationFeePaid,
      }
      console.log("Student object to add:", student)
      await studentService.addStudent(student)
      console.log("Student added successfully")
      const updatedStudents = await studentService.getAllStudents()
      onStudentsUpdate(updatedStudents)
      setNewStudent({
        name: "",
        schoolYear: "",
        specialty: "",
        address: "",
        birth_date: "",
        phone: "",
        email: "",
        school: "",
        photos: false,
        copyOfId: false,
        registrationForm: false,
        registrationFeePaid: false,
      })
      setShowAddStudentDialog(false)
    } catch (error) {
      console.error("Error adding student:", error)
      alert("Failed to add student: " + (error as Error).message)
    }
  }

  const handleArchiveStudent = async (studentId: number, studentName: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || '{}')
      
      // Create archive request in database
      // This would be implemented with a proper database call
      // For now, we'll just mark the student as archived directly
      await studentService.archiveStudent(studentId)
      
      // Update local state
      const updatedStudents = await studentService.getAllStudents()
      onStudentsUpdate(updatedStudents)
    } catch (error) {
      // Error creating archive request
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
                      checked={newStudent.registrationFeePaid}
                      onCheckedChange={(checked) =>
                        setNewStudent({ ...newStudent, registrationFeePaid: checked as boolean })
                      }
                    />
                    <Label htmlFor="registrationFee">Registration Fee Paid</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Student</Button>
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
              <TableHead>Name</TableHead>
              <TableHead>School Year</TableHead>
              <TableHead>Specialty</TableHead>
              {showCourses && <TableHead>Enrolled Courses</TableHead>}
              {showPaymentStatus && <TableHead>Payment Status</TableHead>}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const studentCourses = getStudentCourses(student.id)
              return (
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
                  <TableCell>{student.school_year}</TableCell>
                  <TableCell>{student.specialty}</TableCell>
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
                      {studentCourses.map((course, idx) => (
                        <Badge
                          key={idx}
                          variant={course.payments?.students?.[student.id] ? "default" : "destructive"}
                          className="mr-1"
                        >
                          {course.payments?.students?.[student.id] ? "Paid" : "Pending"}
                        </Badge>
                      ))}
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchiveStudent(student.id, student.name)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
