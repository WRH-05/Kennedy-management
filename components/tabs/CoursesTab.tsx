"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import { AddCourseDialog } from "./CourseTab/AddCourseDialog"
import { CourseTableRow } from "./CourseTab/CourseTableRow"
import { archiveService } from "@/services/archiveService"
import { useToast } from "@/hooks/use-toast"

interface CoursesTabProps {
  courses: any[]
  onCoursesUpdate: (courses: any[]) => void
  canAdd?: boolean
  pendingArchiveIds?: Set<string>
}

export default function CoursesTab({
  courses,
  onCoursesUpdate,
  canAdd = false,
  pendingArchiveIds = new Set(),
}: CoursesTabProps) {
  const { toast } = useToast()

  const handleArchiveCourse = async (courseId: number, courseName: string) => {
    try {
      await archiveService.createArchiveRequest("course", courseId, courseName)
      toast({
        title: "Archive request submitted",
        description: "Waiting for manager approval.",
      })
    } catch (error) {
      console.error("Error creating archive request:", error)
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
            <BookOpen className="h-5 w-5 mr-2" />
            All Courses
          </CardTitle>
          {canAdd && (
            <AddCourseDialog 
              onCourseAdded={onCoursesUpdate} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-113.75 overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
<<<<<<< HEAD
              {courses.map((course) => {
                const enrolledStudents = students.filter((s) => course.student_ids?.includes(s.id))
                return (
                  <TableRow key={course.id} className="group">
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/course/${course.id}`)}
                      >
                        {course.subject} - {course.school_year}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/teacher/${course.teacher_id}`)}
                      >
                        {course.teacher_name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.course_type === "Group" ? "default" : "secondary"}>
                        {course.course_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.schedule}</TableCell>
                    <TableCell>{enrolledStudents.length} students</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <span>{course.price} DA {course.course_type === "Group" ? "/month" : "/session"}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/course/${course.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleArchiveCourse(course.id, `${course.subject} - ${course.school_year}`)}
                              className={pendingArchiveIds.has(course.id) ? "text-gray-400 cursor-not-allowed" : "text-orange-600"}
                              disabled={pendingArchiveIds.has(course.id)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {pendingArchiveIds.has(course.id) ? "Archive Pending" : "Archive"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
=======
              {courses.map((course) => (
                <CourseTableRow
                  key={course.id}
                  course={course}
                  pendingArchiveIds={pendingArchiveIds}
                  onArchive={handleArchiveCourse}
                />
              ))}
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}