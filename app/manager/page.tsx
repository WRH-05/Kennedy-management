"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, DollarSign, Users, BookOpen, TrendingUp, Calendar, Search, Settings } from "lucide-react"
import { paymentService, studentService, teacherService, courseService } from "@/services/appDataService"
import { useAuth } from "@/contexts/AuthContext"
import AuthGuard from "@/components/auth/AuthGuard"
import StudentsTab from "@/components/tabs/StudentsTab"
import TeachersTab from "@/components/tabs/TeachersTab"
import CoursesTab from "@/components/tabs/CoursesTab"
import ArchiveTab from "@/components/tabs/ArchiveTab"
import RevenueTab from "@/components/tabs/RevenueTab"
import PayoutsTab from "@/components/tabs/PayoutsTab"
import UserManagementTab from "@/components/tabs/UserManagementTab"

export default function ManagerDashboard() {
  const router = useRouter()
  const { user, signOut, hasRole } = useAuth()
  const [revenue, setRevenue] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [allPayments, setAllPayments] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState("2024-01")
  const [loading, setLoading] = useState(true)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    // signOut handles the redirect internally
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [revenueData, payoutsData, studentsData, teachersData, coursesData, paymentsData] = await Promise.all([
          paymentService.getRevenueData(),
          paymentService.getPendingPayouts(),
          studentService.getAllStudents(),
          teacherService.getAllTeachers(),
          courseService.getAllCourseInstances(),
          paymentService.getAllPayments(),
        ])

        // Filter out archived items with null checking
        const activeStudents = (studentsData || []).filter((student: any) => !student.archived)
        const activeTeachers = (teachersData || []).filter((teacher: any) => !teacher.archived)
        const activeCourses = (coursesData || []).filter((course: any) => !course.archived)

        setRevenue(revenueData)
        setPayouts(payoutsData)
        setStudents(activeStudents)
        setTeachers(activeTeachers)
        setCourses(activeCourses)
        setAllPayments(paymentsData)
      } catch (error) {
        // Error loading data
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const approvePayment = async (paymentId: string, paymentType: string) => {
    try {
      await paymentService.updatePaymentStatus(paymentId, 'approved', user?.profile?.name || 'Manager')
      // Reload payments to reflect the change
      const updatedPayments = await paymentService.getAllPayments()
      setAllPayments(updatedPayments)
    } catch (error) {
      // Error approving payment
    }
  }

  // Enhanced search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const studentResults = students
        .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((student) => ({ ...student, type: "student" }))

      const teacherResults = teachers
        .filter((teacher) => teacher.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((teacher) => ({ ...teacher, type: "teacher" }))

      const courseResults = courses
        .filter(
          (course) =>
            course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.school_year.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((course) => ({ ...course, type: "course" }))

      setSearchResults([...studentResults, ...teacherResults, ...courseResults])
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, students, teachers, courses])

  const handleSearchResultClick = (result: any) => {
    if (result.type === "student") {
      router.push(`/student/${result.id}`)
    } else if (result.type === "teacher") {
      router.push(`/teacher/${result.id}`)
    } else if (result.type === "course") {
      router.push(`/course/${result.id}`)
    }
    setSearchQuery("")
    setShowSearchResults(false)
  }

  const approvePayout = async (payoutId: number) => {
    try {
      await approvePayment(payoutId.toString(), 'payout')
    } catch (error) {
      // Error approving payout
    }
  }

  const handleMonthlyRollover = () => {
    // Monthly rollover functionality would be implemented here
    // This would copy active group courses to new month
  }

  const totalRevenue = revenue.reduce((sum: number, item: any) => sum + (item.status === 'paid' && item.amount ? item.amount : 0), 0)
  const totalPayouts = payouts.reduce((sum: number, payout: any) => sum + (payout.status === 'approved' && payout.amount ? payout.amount : 0), 0)
  const netProfit = totalRevenue - totalPayouts

  if (loading) return null

  return (
    <AuthGuard requiredRoles={['owner', 'manager']}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Manager Dashboard</h1>
            
            {/* Enhanced Global Search */}
            <div className="flex-1 max-w-md mx-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students, teachers, courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Enhanced Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
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

            <div className="flex items-center space-x-4">
              <Button onClick={handleMonthlyRollover} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Monthly Rollover
              </Button>
              <span className="text-sm text-gray-600">Welcome, {user?.profile?.full_name || 'Manager'}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.profile?.schools?.name || 'School'}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} DA</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPayouts.toLocaleString()} DA</div>
              <p className="text-xs text-muted-foreground">To teachers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{netProfit.toLocaleString()} DA</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
            {hasRole(['owner', 'manager']) && (
              <TabsTrigger value="users">
                <Settings className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            )}
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <RevenueTab revenue={revenue} />
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <PayoutsTab payouts={payouts} onApprovePayout={approvePayout} />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <StudentsTab 
              students={students}
              courses={courses}
              onStudentsUpdate={setStudents}
              canAdd={true}
              showCourses={true}
              showPaymentStatus={true}
            />
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <TeachersTab 
              teachers={teachers}
              courses={courses}
              onTeachersUpdate={setTeachers}
              canAdd={true}
              showCourses={true}
              showStats={true}
            />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <CoursesTab 
              courses={courses}
              teachers={teachers}
              students={students}
              onCoursesUpdate={setCourses}
              canAdd={true}
            />
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive">
            <ArchiveTab isManager={true} onArchiveUpdate={() => {
              // Reload data when archive status changes
              const loadData = async () => {
                try {
                  const [studentsData, teachersData, coursesData] = await Promise.all([
                    studentService.getAllStudents(),
                    teacherService.getAllTeachers(),
                    courseService.getAllCourseInstances(),
                  ])
                  setStudents(studentsData)
                  setTeachers(teachersData)
                  setCourses(coursesData)
                } catch (error) {
                  // Error reloading data
                }
              }
              loadData()
            }} />
          </TabsContent>

          {/* User Management Tab */}
          {hasRole(['owner', 'manager']) && (
            <TabsContent value="users">
              <UserManagementTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
    </AuthGuard>
  )
}
