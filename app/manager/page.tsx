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
import { LogOut, DollarSign, Users, BookOpen, TrendingUp, Calendar, Search } from "lucide-react"
import { paymentService, studentService, teacherService, courseService } from "@/src/services/dataService"
import StudentsTab from "@/components/tabs/StudentsTab"
import TeachersTab from "@/components/tabs/TeachersTab"
import CoursesTab from "@/components/tabs/CoursesTab"

export default function ManagerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
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

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "manager") {
        router.push("/")
        return
      }
      setUser(parsedUser)
    } else {
      router.push("/")
    }
  }, [router])

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

        setRevenue(revenueData)
        setPayouts(payoutsData)
        setStudents(studentsData)
        setTeachers(teachersData)
        setCourses(coursesData)
        setAllPayments(paymentsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const approvePayment = async (paymentId: string, paymentType: string) => {
    try {
      await paymentService.updatePaymentStatus(paymentId, 'approved', user.username)
      // Reload payments to reflect the change
      const updatedPayments = await paymentService.getAllPayments()
      setAllPayments(updatedPayments)
    } catch (error) {
      console.error('Error approving payment:', error)
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
            course.schoolYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()),
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
      console.error('Error approving payout:', error)
    }
  }

  const handleMonthlyRollover = () => {
    // Simulate monthly rollover - copy active group courses to new month
    alert("Monthly rollover completed! Active group courses have been copied to the new month.")
  }

  const totalRevenue = revenue.reduce((sum: number, item: any) => sum + (item.paid && item.amount ? item.amount : 0), 0)
  const totalPayouts = payouts.reduce((sum: number, payout: any) => sum + (payout.status === 'approved' && payout.amount ? payout.amount : 0), 0)
  const netProfit = totalRevenue - totalPayouts

  if (!user || loading) return null

  return (
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
                          {result.schoolYear} - {result.school}
                        </p>
                      )}
                      {result.type === "teacher" && (
                        <p className="text-sm text-gray-600">{result.subjects?.join(", ")}</p>
                      )}
                      {result.type === "course" && (
                        <p className="text-sm text-gray-600">
                          {result.teacherName} - {result.schoolYear} - {result.schedule}
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
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenue.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.studentName || 'N/A'}</TableCell>
                        <TableCell>{item.course || 'N/A'}</TableCell>
                        <TableCell>{(item.amount || 0).toLocaleString()} DA</TableCell>
                        <TableCell>{item.month || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={item.paid ? "default" : "destructive"}>
                            {item.paid ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Teacher Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher Name</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Total Generated</TableHead>
                      <TableHead>Total Payout</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{payout.professorName || 'N/A'}</TableCell>
                        <TableCell>{payout.percentage || 'N/A'}%</TableCell>
                        <TableCell>{(payout.totalGenerated || 0).toLocaleString()} DA</TableCell>
                        <TableCell>{(payout.amount || 0).toLocaleString()} DA</TableCell>
                        <TableCell>{payout.dueDate || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={payout.status === 'approved' ? "default" : "destructive"}>
                            {payout.status === 'approved' ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payout.status !== 'approved' && (
                            <Button variant="outline" size="sm" onClick={() => approvePayout(payout.id)}>
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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

          {/* Unified Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    All Payments Management
                  </CardTitle>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-01">January 2024</SelectItem>
                      <SelectItem value="2023-12">December 2023</SelectItem>
                      <SelectItem value="2023-11">November 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Group payments by month */}
                  {Object.entries(
                    allPayments.reduce((acc: Record<string, any[]>, payment: any) => {
                      const month = payment.month || new Date(payment.timeline).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                      if (!acc[month]) acc[month] = []
                      acc[month].push(payment)
                      return acc
                    }, {} as Record<string, any[]>)
                  ).map(([month, monthPayments]: [string, any[]]) => (
                    <div key={month} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-4 text-gray-800">{month}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User Role</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Approved By</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthPayments
                            .sort((a: any, b: any) => new Date(b.timeline).getTime() - new Date(a.timeline).getTime())
                            .map((payment: any, idx: number) => (
                            <TableRow key={`${payment.id}_${idx}`}>
                              <TableCell>
                                <Badge variant={payment.userRole === 'Student' ? "default" : "secondary"}>
                                  {payment.userRole}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => {
                                    if (payment.userRole === 'Student') {
                                      router.push(`/student/${payment.userId}`)
                                    } else if (payment.userRole === 'Professor') {
                                      router.push(`/teacher/${payment.userId}`)
                                    }
                                  }}
                                >
                                  {payment.userName}
                                </Button>
                              </TableCell>
                              <TableCell>{payment.description}</TableCell>
                              <TableCell className="font-medium">{payment.amount?.toLocaleString()} DA</TableCell>
                              <TableCell>
                                {payment.date || new Date(payment.timeline).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  payment.status === 'Paid' || payment.status === 'approved' 
                                    ? "default" 
                                    : payment.status === 'Pending' 
                                    ? "destructive" 
                                    : "secondary"
                                }>
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {payment.approvedBy ? (
                                  <div className="text-sm">
                                    <div className="font-medium">{payment.approvedBy}</div>
                                    <div className="text-gray-500">{payment.approvedDate}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {(payment.status === 'Pending' || payment.status === 'pending') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => approvePayment(payment.id, payment.paymentType)}
                                  >
                                    Approve
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                  
                  {allPayments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No payment records found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
