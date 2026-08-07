"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Search, LogOut, Menu } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { FoundPeople, searchAllCourseInstancesTeachersStudents } from "@/services/courseInstanceTeacherStudentSearch"

export default function DashboardHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResult] = useState<FoundPeople[]>([])
  const { profile } = useAuth()

  const handleSignOut = async () => {
    await authService.signOut()
    router.push('/')
  }

  const getTeacherSubjects = (teacher: any) =>
    Array.from(
      new Set(
        teacher?.teachers_course_eligibility?.flatMap((eligibility: any) =>
          eligibility.course_eligibility?.courses?.name
            ? [eligibility.course_eligibility.courses.name]
            : []
        ) ?? []
      )
    )

  // Debounced Search Effect
  useEffect(() => {
    // 1. Immediately clear results if query is empty
    if (!searchQuery.trim()) {
      setSearchResult([])
      return
    }

    // 2. Set up a 200ms debounce timer
    const delayDebounceFn = setTimeout(() => {
      const query = searchQuery.toLowerCase()

      searchAllCourseInstancesTeachersStudents(query)
        .then((cits) => {
          setSearchResult(cits.data)
        })
        .catch((e) => {
          console.error("Can't perform search: ", e)
        })
    }, 200) // 200ms delay

    // 3. Clean up the timer if the user types again before 200ms passes
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const showSearchResults = searchQuery.trim().length > 0 && searchResults.length > 0

  const handleSearchResultClick = (result: FoundPeople) => {
    if (result.type === "student") {
      router.push(`/student/${result.id}`)
    } else if (result.type === "teacher") {
      router.push(`/teacher/${result.id}`)
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