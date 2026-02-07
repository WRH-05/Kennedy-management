"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GraduationCap, Plus, Archive, MoreHorizontal, Pencil } from "lucide-react"
import { teacherService } from "@/services/appDataService"

interface TeachersTabProps {
  teachers: any[]
  courses: any[]
  onTeachersUpdate: (teachers: any[]) => void
  canAdd?: boolean
  showCourses?: boolean
  showStats?: boolean
}

export default function TeachersTab({ 
  teachers, 
  courses, 
  onTeachersUpdate, 
  canAdd = false,
  showCourses = true,
  showStats = false
}: TeachersTabProps) {
  const router = useRouter()
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false)
  
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    school: "",
    schoolYears: [] as string[],
    subjects: [] as string[],
  })

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (newTeacher.subjects.length === 0) {
      alert("Please select at least one subject")
      return
    }
    
    if (newTeacher.schoolYears.length === 0) {
      alert("Please select at least one school year")
      return
    }
    
    try {
      console.log("Adding teacher:", newTeacher)
      const teacher = {
        name: newTeacher.name,
        address: newTeacher.address,
        phone: newTeacher.phone,
        email: newTeacher.email,
        school: newTeacher.school,
        school_years: newTeacher.schoolYears, // Send as array, not comma-separated string
        subjects: newTeacher.subjects, // Send as array, not comma-separated string
      }
      console.log("Teacher object to add:", teacher)
      await teacherService.addTeacher(teacher)
      console.log("Teacher added successfully")
      const updatedTeachers = await teacherService.getAllTeachers()
      onTeachersUpdate(updatedTeachers)
      setNewTeacher({
        name: "",
        address: "",
        phone: "",
        email: "",
        school: "",
        schoolYears: [],
        subjects: [],
      })
      setShowAddTeacherDialog(false)
    } catch (error) {
      console.error("Error adding teacher:", error)
      alert("Failed to add teacher: " + (error as Error).message)
    }
  }

  const handleMultiSelect = (value: string, currentArray: string[], setter: (arr: string[]) => void) => {
    if (currentArray.includes(value)) {
      setter(currentArray.filter((item) => item !== value))
    } else {
      setter([...currentArray, value])
    }
  }

  const getTeacherCourses = (teacherId: number) => {
    return (courses || []).filter((course) => course.teacher_id === teacherId)
  }

  const handleArchiveTeacher = async (teacherId: number, teacherName: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || '{}')
      
      // Create archive request in database
      // This would be implemented with a proper database call
      // For now, we'll just mark the teacher as archived directly
      await teacherService.archiveTeacher(teacherId)
      
      // Update local state
      const updatedTeachers = await teacherService.getAllTeachers()
      onTeachersUpdate(updatedTeachers)
    } catch (error) {
      // Error creating archive request
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Teacher List
          </CardTitle>
          {canAdd && (
            <Dialog open={showAddTeacherDialog} onOpenChange={setShowAddTeacherDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Teacher</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTeacher} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profName">Full Name</Label>
                      <Input
                        id="profName"
                        value={newTeacher.name}
                        onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profAddress">Address</Label>
                      <Input
                        id="profAddress"
                        value={newTeacher.address}
                        onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profPhone">Phone Number</Label>
                      <Input
                        id="profPhone"
                        value={newTeacher.phone}
                        onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profEmail">Email (Optional)</Label>
                      <Input
                        id="profEmail"
                        type="email"
                        value={newTeacher.email}
                        onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profSchool">School They Work At</Label>
                      <Input
                        id="profSchool"
                        value={newTeacher.school}
                        onChange={(e) => setNewTeacher({ ...newTeacher, school: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profSchoolYears">School Years They Teach</Label>
                      <Select
                        onValueChange={(value) =>
                          handleMultiSelect(value, newTeacher.schoolYears, (arr) =>
                            setNewTeacher({ ...newTeacher, schoolYears: arr }),
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select school years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1AS">1AS</SelectItem>
                          <SelectItem value="2AS">2AS</SelectItem>
                          <SelectItem value="3AS">3AS</SelectItem>
                          <SelectItem value="BEM">BEM</SelectItem>
                          <SelectItem value="BAC">BAC</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newTeacher.schoolYears.map((year) => (
                          <Badge
                            key={year}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() =>
                              handleMultiSelect(year, newTeacher.schoolYears, (arr) =>
                                setNewTeacher({ ...newTeacher, schoolYears: arr }),
                              )
                            }
                          >
                            {year} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="profSubjects">Subjects They Teach</Label>
                      <Select
                        onValueChange={(value) =>
                          handleMultiSelect(value, newTeacher.subjects, (arr) =>
                            setNewTeacher({ ...newTeacher, subjects: arr }),
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subjects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Geography">Geography</SelectItem>
                          <SelectItem value="Philosophy">Philosophy</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newTeacher.subjects.map((subject) => (
                          <Badge
                            key={subject}
                            variant="default"
                            className="cursor-pointer"
                            onClick={() =>
                              handleMultiSelect(subject, newTeacher.subjects, (arr) =>
                                setNewTeacher({ ...newTeacher, subjects: arr }),
                              )
                            }
                          >
                            {subject} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddTeacherDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Add Teacher
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[455px] overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>School</TableHead>
                <TableHead>School Years</TableHead>
                <TableHead>Active Courses</TableHead>
                {showStats && (
                  <>
                    <TableHead>Students</TableHead>
                    <TableHead>Total Earnings</TableHead>
                  </>
                )}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(teachers || []).map((teacher) => {
                const teacherCourses = getTeacherCourses(teacher.id)
                return (
                  <TableRow key={teacher.id} className="group">
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/teacher/${teacher.id}`)}
                      >
                        {teacher.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {teacher.subjects && (teacher.subjects.length > 0 || typeof teacher.subjects === 'string') ? 
                        (Array.isArray(teacher.subjects) 
                          ? teacher.subjects 
                          : (typeof teacher.subjects === 'string' ? teacher.subjects.split(',') : [])
                        ).filter((s: string) => s && s.trim()).map((subject: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="mr-1">
                            {subject.trim()}
                          </Badge>
                        )) : 
                        <span className="text-gray-500">No subjects</span>
                      }
                    </TableCell>
                    <TableCell>{teacher.school}</TableCell>
                    <TableCell>
                      {teacher.school_years && (teacher.school_years.length > 0 || typeof teacher.school_years === 'string') ? 
                        (Array.isArray(teacher.school_years) 
                          ? teacher.school_years 
                          : (typeof teacher.school_years === 'string' ? teacher.school_years.split(',') : [])
                        ).filter((y: string) => y && y.trim()).map((year: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="mr-1">
                            {year.trim()}
                          </Badge>
                        )) : 
                        <span className="text-gray-500">No school years</span>
                      }
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{teacherCourses.length} course(s)</span>
                    </TableCell>
                    {showStats && (
                      <>
                        <TableCell>{teacher.students || 0}</TableCell>
                        <TableCell>{(teacher.totalEarnings || 0).toLocaleString()} DA</TableCell>
                      </>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/teacher/${teacher.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleArchiveTeacher(teacher.id, teacher.name)}
                            className="text-orange-600"
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
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
