"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, DollarSign, Users, BookOpen, TrendingUp, Calendar } from "lucide-react"
import { DataService } from "@/services/dataService"
import type { Student } from "@/mocks/students"
import type { Teacher } from "@/mocks/teachers"
import type { Course } from "@/mocks/courses"
import type { PaymentRecord } from "@/mocks/payments"
import { SortControls, type SortConfig } from "@/components/ui/sort-controls"

// Mock data for manager view with enhanced payment histories
const mockRevenue = [
  { studentName: "Ahmed Ben Ali", course: "Mathematics", amount: 500, month: "2024-01", paid: true },
  { studentName: "Fatima Zahra", course: "Physics", amount: 800, month: "2024-01", paid: false },
  { studentName: "Fatima Zahra", course: "Chemistry", amount: 450, month: "2024-01", paid: true },
  { studentName: "Omar Khaled", course: "Biology", amount: 600, month: "2024-01", paid: true },
]

const mockPayouts = [
  {
    teacherName: "Prof. Salim",
    percentage: 65,
    totalGenerated: 1500,
    totalPayout: 975,
    approved: false,
    month: "2024-01",
  },
  {
    teacherName: "Prof. Amina",
    percentage: 70,
    totalGenerated: 2400,
    totalPayout: 1680,
    approved: true,
    month: "2024-01",
  },
  {
    teacherName: "Prof. Omar",
    percentage: 60,
    totalGenerated: 1350,
    totalPayout: 810,
    approved: false,
    month: "2024-01",
  },
]

const mockStudentData = [
  { id: 1, name: "Ahmed Ben Ali", schoolYear: "3AS", totalPaid: 500, coursesEnrolled: 1 },
  { id: 2, name: "Fatima Zahra", schoolYear: "BAC", totalPaid: 450, coursesEnrolled: 2 },
  { id: 3, name: "Omar Khaled", schoolYear: "2AS", totalPaid: 600, coursesEnrolled: 1 },
]

const mockTeacherData = [
  { id: 1, name: "Prof. Salim", subjects: ["Mathematics"], students: 15, totalEarnings: 975 },
  { id: 2, name: "Prof. Amina", subjects: ["Physics"], students: 12, totalEarnings: 1680 },
  { id: 3, name: "Prof. Omar", subjects: ["Chemistry"], students: 18, totalEarnings: 810 },
]

const mockStudentPaymentHistory = [
  {
    studentId: 1,
    studentName: "Ahmed Ben Ali",
    month: "2024-01",
    courses: [{ course: "Mathematics", amount: 500, paid: true }],
  },
  {
    studentId: 2,
    studentName: "Fatima Zahra",
    month: "2024-01",
    courses: [
      { course: "Physics", amount: 800, paid: false },
      { course: "Chemistry", amount: 450, paid: true },
    ],
  },
]

const mockProfessorPaymentHistory = [
  {
    professorId: 1,
    professorName: "Prof. Salim",
    month: "2024-01",
    sessions: [{ course: "Mathematics", students: 1, amount: 975, paid: false }],
  },
  {
    professorId: 2,
    professorName: "Prof. Amina",
    month: "2024-01",
    sessions: [{ course: "Physics", students: 1, amount: 1680, paid: true }],
  },
]

export default function ManagerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [payouts, setPayouts] = useState(mockPayouts)
  const [selectedMonth, setSelectedMonth] = useState("2024-01")
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "manager") {
        router.push("/")
        return
      }
      setUser(parsedUser)

      // Load data from DataService
      setStudents(DataService.getStudents())
      setTeachers(DataService.getTeachers())
      setCourses(DataService.getCourses())
      setPayments(DataService.getPayments())
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const approvePayout = (teacherName: string) => {
    setPayouts(payouts.map((payout) => (payout.teacherName === teacherName ? { ...payout, approved: true } : payout)))
  }

  const handleMonthlyRollover = () => {
    // Simulate monthly rollover - copy active group courses to new month
    alert("Monthly rollover completed! Active group courses have been copied to the new month.")
  }

  const totalRevenue = courses.reduce((sum, course) => {
    return (
      sum +
      Object.entries(course.current.payments.students)
        .filter(([_, paid]) => paid)
        .reduce((courseSum, _) => courseSum + course.price, 0)
    )
  }, 0)

  const totalPayouts = payments
    .filter((p) => p.status === "approved" && p.type === "teacher")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const netProfit = totalRevenue - totalPayouts

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null
    }
    setSortConfig({ key, direction })
  }

  const sortData = <T extends Record<string, any>>(data: T[], key: string, direction: "asc" | "desc" | null): T[] => {
    if (!direction) return data

    return [...data].sort((a, b) => {
      let aVal = a[key]
      let bVal = b[key]

      // Handle special cases
      if (key === "nextSession") {
        aVal = new Date(aVal || "9999-12-31").getTime()
        bVal = new Date(bVal || "9999-12-31").getTime()
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return direction === "asc" ? -1 : 1
      if (aVal > bVal) return direction === "asc" ? 1 : -1
      return 0
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Manager Dashboard</h1>
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

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Payments Tab - Merged from Student and Professor payments */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Payment Management
                  </CardTitle>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-02">February 2025</SelectItem>
                      <SelectItem value="2025-01">January 2025</SelectItem>
                      <SelectItem value="2024-12">December 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(
                    payments
                      .filter((p) => p.month === selectedMonth)
                      .reduce(
                        (acc, payment) => {
                          if (!acc[payment.month]) acc[payment.month] = []
                          acc[payment.month].push(payment)
                          return acc
                        },
                        {} as Record<string, PaymentRecord[]>,
                      ),
                  ).map(([month, monthPayments]) => (
                    <div key={month} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">
                        {new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthPayments.map((payment) => {
                            const name =
                              payment.type === "student"
                                ? students.find((s) => s.id === payment.studentId)?.name
                                : teachers.find((t) => t.id === payment.teacherId)?.name

                            return (
                              <TableRow key={payment.id}>
                                <TableCell>
                                  <Badge variant={payment.type === "student" ? "default" : "secondary"}>
                                    {payment.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{name}</TableCell>
                                <TableCell>{payment.courseName}</TableCell>
                                <TableCell>{payment.amount} DA</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      payment.status === "approved"
                                        ? "default"
                                        : payment.status === "rejected"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                  >
                                    {payment.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{payment.createdBy}</TableCell>
                                <TableCell>
                                  {payment.status === "pending" && (
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          DataService.approvePayment(payment.id, user.username)
                                          setPayments(DataService.getPayments())
                                        }}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          DataService.updatePayment(payment.id, { status: "rejected" })
                                          setPayments(DataService.getPayments())
                                        }}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                  {payment.status === "approved" && (
                                    <span className="text-sm text-gray-600">by {payment.approvedBy}</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab - Same as Receptionist */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Student Management
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <SortControls sortKey="name" currentSort={sortConfig} onSort={handleSort} label="Name" />
                    <SortControls
                      sortKey="schoolYear"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      label="School Year"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortData(students, sortConfig.key, sortConfig.direction).map((student) => {
                      const studentCourses = courses.filter((c) => c.current.enrolledStudents.includes(student.id))
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => router.push(`/student/${student.id}`)}
                            >
                              {student.name}
                            </Button>
                          </TableCell>
                          <TableCell>{student.schoolYear}</TableCell>
                          <TableCell>{student.specialty}</TableCell>
                          <TableCell>
                            {studentCourses.map((course, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1">
                                {course.subject}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            {studentCourses.map((course, idx) => (
                              <Badge
                                key={idx}
                                variant={course.current.payments.students[student.id] ? "default" : "destructive"}
                                className="mr-1"
                              >
                                {course.current.payments.students[student.id] ? "Paid" : "Pending"}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/student/${student.id}`)}>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab - Same as Receptionist */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Teacher Management
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <SortControls sortKey="name" currentSort={sortConfig} onSort={handleSort} label="Name" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>School Years</TableHead>
                      <TableHead>Active Courses</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortData(teachers, sortConfig.key, sortConfig.direction).map((teacher) => {
                      const teacherCourses = courses.filter((c) => c.teacherId === teacher.id && c.status === "active")
                      return (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => router.push(`/professor/${teacher.id}`)}
                            >
                              {teacher.name}
                            </Button>
                          </TableCell>
                          <TableCell>
                            {teacher.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1">
                                {subject}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>{teacher.school}</TableCell>
                          <TableCell>
                            {teacher.schoolYears.map((year, idx) => (
                              <Badge key={idx} variant="outline" className="mr-1">
                                {year}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{teacherCourses.length} course(s)</span>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/professor/${teacher.id}`)}>
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab - Same as Receptionist */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Course Management
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <SortControls sortKey="status" currentSort={sortConfig} onSort={handleSort} label="Status" />
                    <SortControls sortKey="subject" currentSort={sortConfig} onSort={handleSort} label="Course" />
                    <SortControls
                      sortKey="nextSession"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      label="Next Session"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Next Session</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortData(courses, sortConfig.key, sortConfig.direction).map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              course.status === "active" ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/course/${course.id}`)}
                          >
                            {course.subject} - {course.schoolYear}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/professor/${course.teacherId}`)}
                          >
                            {course.teacherName}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.courseType === "Group" ? "default" : "secondary"}>
                            {course.courseType}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.schedule}</TableCell>
                        <TableCell>{course.current.enrolledStudents.length} students</TableCell>
                        <TableCell>
                          {course.price} DA {course.courseType === "Group" ? "/month" : "/session"}
                        </TableCell>
                        <TableCell>
                          {course.nextSession ? new Date(course.nextSession).toLocaleDateString() : "TBD"}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/course/${course.id}`)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab - Renamed from previous tabs */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Monthly Revenue</p>
                      <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} DA</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Payouts</p>
                      <p className="text-2xl font-bold text-blue-600">{totalPayouts.toLocaleString()} DA</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Net Profit</p>
                      <p className="text-2xl font-bold text-purple-600">{netProfit.toLocaleString()} DA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">Active Students</p>
                      <p className="text-2xl font-bold text-orange-600">{students.length}</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Active Teachers</p>
                      <p className="text-2xl font-bold text-red-600">{teachers.length}</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-gray-600">Active Courses</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {courses.filter((c) => c.status === "active").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
