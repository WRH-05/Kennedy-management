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

interface GradeLevelManagementCardProps {
  gradeLevels: {
    data: AssociatedGradeLevelsCourses[]
    total: number
    page: number
    pageSize: number
  },
  courseId: string,
  onRefresh: () => Promise<void>
}

export function GradeLevelManagementCard({ gradeLevels, courseId, onRefresh }: GradeLevelManagementCardProps) {

  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [showGradeLevelsResults, setShowGradeLevelsResults] = useState(false)
  const [filteredGradeLevels, setFilteredGradeLevels] = useState<Tables<"grade_levels">[]>([])
  const [gradeSearchQuery, setGradeSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")


  const inputSearch = (name: string) => {
    if (name.length == 0) return
    gradeLevelsService.getAllGradeLevelsByName(name).then((v) => {
      setFilteredGradeLevels(v.data);
    })
      .catch((e) => {
        console.error(e);
      })
  }

  const handleAddGradeLevel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId) return
    try {
      if (!selectedLevel) return
      await coursesEligiblityService.addCourseEligibility({ course_id: courseId, grade_level_id: selectedLevel })
      toast({ title: "Success", description: "New Level added." })

      onRefresh()

      setSelectedLevel("")
      setGradeSearchQuery("")
      setShowAddCourseDialog(false)
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
          <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
            <DialogTrigger asChild className="m-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Level
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Level to Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGradeLevel} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentSearch">Grade Level Name</Label>
                  <div className="relative">
                    <Input
                      id="studentSearch"
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
                            onMouseDown={() => {
                              setSelectedLevel(level.id.toString())
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
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddCourseDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Grade Level</Button>
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
            <h3 className="font-medium text-lg mb-4">Active grades</h3>
            {gradeLevels.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeLevels.data.map((gradeLevel) => (
                    <TableRow key={gradeLevel.grade_levels.id}>
                      <TableCell className="font-medium">
                        <Link href={`/grade-level/${gradeLevel.grade_levels.id}`} className="hover:underline">
                          {gradeLevel.grade_levels.name}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-600">No active courseInstances</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}