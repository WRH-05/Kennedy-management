"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Search } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { FoundPeople, searchAllCourseInstancesTeachersStudents } from "@/services/courseInstanceTeacherStudentSearch"

export default function DashboardHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResult] = useState<FoundPeople[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { profile } = useAuth()

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

  // Hide the dropdown when the user clicks anywhere outside the search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Clear the query and hide results whenever the route changes
  useEffect(() => {
    setSearchQuery("")
    setSearchResult([])
    setIsSearchOpen(false)
  }, [pathname])

  const showSearchResults = isSearchOpen && searchQuery.trim().length > 0 && searchResults.length > 0

  const handleSearchResultClick = (result: FoundPeople) => {
    if (result.type === "student") {
      router.push(`/student/${result.id}`)
    } else if (result.type === "teacher") {
      router.push(`/teacher/${result.id}`)
    } else if (result.type === "course-instance") {
      router.push(`/course-instance/${result.id}`)
    }
    setSearchQuery("")
    setIsSearchOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Sidebar Trigger (mobile toggle, hidden on desktop since sidebar is permanent) */}
          <SidebarTrigger className="md:hidden" />

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students, teachers, course instances..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
              />
            </div>

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium">{result.name}</div>
                        {result.type === "course-instance" && result.subtitle && (
                          <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                        )}
                      </div>
                      <Badge
                        variant={
                          result.type === "student" ? "default" : result.type === "teacher" ? "secondary" : "outline"
                        }
                      >
                        {result.type === "student" ? "Student" : result.type === "teacher" ? "Teacher" : "Course"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side — Welcome */}
          <div className="flex items-center shrink-0">
            <span className="text-sm text-gray-600 hidden lg:inline">
              Welcome, {profile?.full_name || 'Manager'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}