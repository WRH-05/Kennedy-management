"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/authService"
import { useStudents } from "@/hooks/useStudents"
import { useTeachers } from "@/hooks/useTeachers"
import { useCourseInstances } from "@/hooks/useCourseInstances"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
// Imported Sheet components for the side slider
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Search, LogOut, Menu } from "lucide-react"
import { Tables } from "@/types/database.types"
import { profileService } from "@/services/profileService"
import { CourseInstanceWithEnrichment } from "@/services/courseInstancesService"
import { useAuth } from "@/context/AuthContext"



export default function DashboardHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const { profile } = useAuth()


  const { students: allStudents } = useStudents();
  const { teachers: allTeachers } = useTeachers();
  const { data: allCourses } = useCourseInstances();

  const students = useMemo(() =>
    (allStudents && 'data' in allStudents ? allStudents.data : []),
    [allStudents]
  )

  const teachers = useMemo(() =>
    (allTeachers && 'data' in allTeachers ? allTeachers.data : []),
    [allTeachers]
  )

  const courseInstances = useMemo(() =>
    (allCourses),
    [allCourses]
  )

  const handleSignOut = async () => {
    await authService.signOut()
    router.push('/')
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()

    const studentResults = students
      .filter((student: Tables<"students">) => student.name?.toLowerCase().includes(query))
      .map((student: Tables<"students">) => ({ ...student, type: "student" }))

    const teacherResults = teachers
      .filter((teacher: Tables<"teachers">) => teacher.name?.toLowerCase().includes(query))
      .map((teacher: Tables<"teachers">) => ({ ...teacher, type: "teacher" }))

    const courseResults = courseInstances
      .filter(
        (course: CourseInstanceWithEnrichment) =>
          course.subject?.toLowerCase().includes(query) ||
          course.school_year?.toLowerCase().includes(query) ||
          course.teachers.name?.toLowerCase().includes(query),
      )
      .map((course: CourseInstanceWithEnrichment) => ({ ...course, type: "course" }))

    return [...studentResults, ...teacherResults, ...courseResults]
  }, [searchQuery, students, teachers, courseInstances])

  const showSearchResults = searchQuery.trim().length > 0 && searchResults.length > 0

  const handleSearchResultClick = (result: { id: string, type: "student" | "teacher" | "course" }) => {
    if (result.type === "student") {
      router.push(`/student/${result.id}`)
    } else if (result.type === "teacher") {
      router.push(`/teacher/${result.id}`)
    } else if (result.type === "course") {
      router.push(`/course-instance/${result.id}`)
    }
    setSearchQuery("")
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Side Slider Button (Sheet) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" title="Open Sidebar">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-75 sm:w-100">
              <SheetHeader>
                <SheetTitle>Quick Actions Panel</SheetTitle>
                <SheetDescription>
                  Access alternative utilities and global management tools here.
                </SheetDescription>
              </SheetHeader>

              {/* Content inside the slider */}
              <div className="py-6 flex flex-col gap-4">

                <div className="flex flex-col gap-2 text-sm border-t pt-4">
                  <p className="font-medium text-slate-900">Mobile Navigation</p>
                  <Link href="/manager" className="p-2 hover:bg-slate-100 rounded-md transition-colors">Main Menu</Link>
                  <Link href="/manager/students" className="p-2 hover:bg-slate-100 rounded-md transition-colors">Students Registry</Link>
                  <Link href="/manager/teachers" className="p-2 hover:bg-slate-100 rounded-md transition-colors">Teachers Registry</Link>
                  <Link href="/manager/course-instances" className="p-2 hover:bg-slate-100 rounded-md transition-colors">Active Course Instances</Link>
                  <Link href="/manager/payouts" className="p-2 hover:bg-slate-100 rounded-md transition-colors">Payments</Link>
                  <Link href="/manager/archive" className="p-2 hover:bg-slate-100 rounded-md transition-colors">Archives</Link>
                  <Link href="/manager/revenue" className="p-2 hover:bg-slate-100 rounded-md transition-colors">Revenue</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 relative">


            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students, teachers, course instances..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result: any, index: number) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.name || result.subject}</span>
                      <Badge
                        variant={
                          result.type === "student" ? "default" : result.type === "teacher" ? "secondary" : "outline"
                        }
                      >
                        {result.type === "student" ? "Student" : result.type === "teacher" ? "Teacher" : "Course"}
                      </Badge>
                    </div>
                    {result.type === "student" && (
                      <p className="text-sm text-gray-600">
                        {result.school_year} - {result.school}
                      </p>
                    )}
                    {result.type === "teacher" && (
                      <p className="text-sm text-gray-600">
                        {result.subjects ? (Array.isArray(result.subjects)
                          ? result.subjects.join(", ")
                          : (typeof result.subjects === 'string' ? result.subjects : "No subjects")
                        ) : "No subjects"}
                      </p>
                    )}
                    {result.type === "course" && (
                      <p className="text-sm text-gray-600">
                        {result.teacher_name} - {result.school_year} - {result.schedule}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">

            <span className="text-sm text-gray-600 hidden lg:inline">
              Welcome, {profile?.full_name || 'Manager'}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden sm:flex">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}