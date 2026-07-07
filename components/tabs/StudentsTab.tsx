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
import { Users, Plus, Archive, MoreHorizontal, Pencil, Loader2 } from "lucide-react"
import { studentService } from "@/services/studentService"
import { archiveService } from "@/services/archiveService"
import { useToast } from "@/hooks/use-toast"
import { Tables, TablesInsert } from "@/types/database.types"
import { courseEnrollmentService } from "@/services/courseEnrollmentService"
import { useEffect } from "react"

interface StudentsTabProps {
  students: Tables<"students">[]
  onStudentsUpdate: (students: Tables<"students">[]) => void
  canAdd?: boolean
  showCourses?: boolean
  showPaymentStatus?: boolean
  pendingArchiveIds?: Set<string>
}

// Sub-component to isolate async course fetching per row
function StudentCoursesCell({ studentId }: { studentId: string }) {
  const [courseInstances, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchCourses() {
      try {
        const data = await courseEnrollmentService.getCourseEnrollmentByStudentId(studentId)
        if (isMounted) {
          setCourses(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchCourses()
    return () => { isMounted = false }
  }, [studentId])

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  if (!courseInstances.length) return <span className="text-muted-foreground text-xs">No courseInstances</span>

  return (
    <>
      {courseInstances.map((course, idx) => (
        <Badge key={idx} variant="secondary" className="mr-1 mb-1">
          {course.course_instances?.subject || "Unknown"}
        </Badge>
      ))}
    </>
  )
}

export default function StudentsTab({
  students,
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

  const [newStudent, setNewStudent] = useState<TablesInsert<"students">>({
    name: "",
    birth_date: "",
    phone: "",
    email: "",
    address: "",
    school: "",
    school_level: "",
    school_year: "",
    specialty: null,
    registration_fee_paid: false,
    archived: false,
    archived_date: null
  })

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

  const getSpecialtyOptions = (schoolYear: string) => {
    if (schoolYear === "1 AS") {
      return [
        { code: "1 AS", name: "Common Core Sciences and Technology" },
        { code: "1 AL", name: "Common Core Arts and Letters" },
      ]
    }
    if (schoolYear === "2 AS" || schoolYear === "3 AS") {
      return [
        { code: schoolYear === "2 AS" ? "2 AS" : "3 AS", name: "Experimental Sciences" },
        { code: schoolYear === "2 AS" ? "2 MA" : "3 MA", name: "Mathematics" },
        { code: schoolYear === "2 AS" ? "2 MT" : "3 MT", name: "Technical Mathematical" },
        { code: schoolYear === "2 AS" ? "2 GE" : "3 GE", name: "Management and Economy" },
        { code: schoolYear === "2 AS" ? "2 LT" : "3 LT", name: "Literature and Philosophy" },
        { code: schoolYear === "2 AS" ? "2 LE" : "3 LE", name: "Foreign Languages" },
      ]
    }
    return []
  }

  const handleSchoolLevelChange = (level: string) => {
    setNewStudent({
      ...newStudent,
      school_level: level,
      school_year: "",
      specialty: null,
    })
  }

  const handleSchoolYearChange = (year: string) => {
    setNewStudent({
      ...newStudent,
      school_year: year,
      specialty: null,
    })
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await studentService.addStudent(newStudent)
      const updatedStudents = await studentService.getAllStudents()
      onStudentsUpdate(updatedStudents.data)
      setNewStudent({
        name: "",
        birth_date: "",
        phone: "",
        email: "",
        address: "",
        school: "",
        school_level: "",
        school_year: "",
        specialty: null,
        registration_fee_paid: false,
        archived: false,
        archived_date: null
      })
      setShowAddStudentDialog(false)
      toast({
        title: "Student added",
        description: `${newStudent.name} has been successfully added.`,
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

  const handleArchiveStudent = async (student_id: string, studentName: string) => {
    try {
      await archiveService.createArchiveRequest('student', student_id, studentName)
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
                        value={newStudent.school_level || ''}
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
                        value={newStudent.school_year || ''}
                        onValueChange={handleSchoolYearChange}
                        disabled={!newStudent.school_level}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={newStudent.school_level ? "Select school year" : "Select level first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {newStudent.school_level && schoolYearOptions[newStudent.school_level as keyof typeof schoolYearOptions]?.map((year) => (
                            <SelectItem key={year.code} value={year.code}>
                              {year.code} - {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newStudent.school_level === "secondary" && newStudent.school_year && (
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
                            {getSpecialtyOptions(newStudent.school_year).map((spec) => (
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
                        value={newStudent.address || ""}
                        onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Birth Date</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={newStudent.birth_date || ""}
                        onChange={(e) => setNewStudent({ ...newStudent, birth_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newStudent.phone || ""}
                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email || ""}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      />
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
                {showCourses && <TableHead>Enrolled courseInstances</TableHead>}
                {showPaymentStatus && <TableHead>Payment Status</TableHead>}
                <TableHead className="w-15"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
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
                        <StudentCoursesCell studentId={student.id} />
                      </TableCell>
                    )}
                    
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