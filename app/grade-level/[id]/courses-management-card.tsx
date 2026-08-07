"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Plus } from "lucide-react"
import Link from "next/link"
import { AssociatedGradeLevelsCourses, gradeLevelsService } from "@/services/gradeLevelsService"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tables } from "@/types/database.types"
import { coursesEligiblityService } from "@/services/courseEligibilityService"
import { toast } from "@/hooks/use-toast"
import { coursesService } from "@/services/coursesService"
import { Badge } from "@/components/ui/badge"

interface CourseManagementCardProps {
  courses: {
    data: AssociatedGradeLevelsCourses[]
    total: number
    page: number
    pageSize: number
  },
  gradeLevelId: string,
  onRefresh: () => Promise<void>
}

export function CourseManagementCard({ courses, gradeLevelId, onRefresh }: CourseManagementCardProps) {

  const [showAddGradeLevelDialog, setShowAddGradeLevelDialog] = useState(false)
  const [showCoursesResults, setShowCoursesResults] = useState(false)
  const [filteredCourses, setFilteredCourses] = useState<Tables<"grade_levels">[]>([])
  const [courseSearchQuery, setCourseSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")


  const inputSearch = (name: string) => {
    if (name.length == 0) return
    coursesService.getAllCoursesByName(name).then((v) => {
      setFilteredCourses(v.data);
    })
      .catch((e) => {
        console.error(e);
      })
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradeLevelId) return
    try {
      if (!selectedCourse) return
      await coursesEligiblityService.addCourseEligibility({ course_id: selectedCourse, grade_level_id: gradeLevelId })
      toast({ title: "Success", description: "New Level added." })

      onRefresh()

      setSelectedCourse("")
      setCourseSearchQuery("")
      setShowAddGradeLevelDialog(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center flex-row">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Grade Levels Management
          </div>
          <Dialog open={showAddGradeLevelDialog} onOpenChange={setShowAddGradeLevelDialog}>
            <DialogTrigger asChild className="m-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Course to Level</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentSearch">Grade Level Name</Label>
                  <div className="relative">
                    <Input
                      id="studentSearch"
                      placeholder="Search for a level..."
                      value={courseSearchQuery}
                      onChange={(e) => {
                        setCourseSearchQuery(e.target.value)
                        setShowCoursesResults(e.target.value.length > 0)
                        inputSearch(e.target.value)
                      }}
                      onBlur={() => setTimeout(() => setShowCoursesResults(false), 150)}
                      onFocus={() => setShowCoursesResults(courseSearchQuery.length > 0)}
                      required
                    />
                    {showCoursesResults && filteredCourses.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                        {filteredCourses.map((level) => (
                          <div
                            key={level.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                            onMouseDown={() => {
                              setSelectedCourse(level.id.toString())
                              setCourseSearchQuery(level.name)
                              setShowCoursesResults(false)
                            }}
                          >
                            <div className="font-medium text-sm text-gray-900">{level.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddGradeLevelDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Course</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Active courseInstances */}
          <div>
            <h3 className="font-medium text-lg mb-4">Active Courses</h3>
            {courses.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.data.map((course) => (
                    <TableRow key={course.courses.id}>
                      <TableCell className="font-medium">
                        <Link href={`/course/${course.courses.id}`} className="hover:underline">
                          {course.courses.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.courses.type === "academic" ? "default" : "secondary"}>
                          {course.courses.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-600">No active Course</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}