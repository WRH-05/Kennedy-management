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

  const totalRevenue = mockRevenue.reduce((sum, item) => sum + (item.paid ? item.amount : 0), 0)
  const totalPayouts = payouts.reduce((sum, payout) => sum + (payout.approved ? payout.totalPayout : 0), 0)
  const netProfit = totalRevenue - totalPayouts

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
              <div className="text-2xl font-bold">{mockStudentData.length}</div>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="student-payments">Student Payments</TabsTrigger>
            <TabsTrigger value="professor-payments">Professor Payments</TabsTrigger>
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
                    {mockRevenue.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.studentName}</TableCell>
                        <TableCell>{item.course}</TableCell>
                        <TableCell>{item.amount.toLocaleString()} DA</TableCell>
                        <TableCell>{item.month}</TableCell>
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
                    {payouts.map((payout, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{payout.teacherName}</TableCell>
                        <TableCell>{payout.percentage}%</TableCell>
                        <TableCell>{payout.totalGenerated.toLocaleString()} DA</TableCell>
                        <TableCell>{payout.totalPayout.toLocaleString()} DA</TableCell>
                        <TableCell>{payout.month}</TableCell>
                        <TableCell>
                          <Badge variant={payout.approved ? "default" : "destructive"}>
                            {payout.approved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!payout.approved && (
                            <Button variant="outline" size="sm" onClick={() => approvePayout(payout.teacherName)}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  All Students Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>Courses Enrolled</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStudentData.map((student) => (
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
                        <TableCell>{student.coursesEnrolled}</TableCell>
                        <TableCell>{student.totalPaid.toLocaleString()} DA</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/student/${student.id}`)}>
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

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  All Teachers Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTeacherData.map((teacher) => (
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
                        <TableCell>{teacher.students}</TableCell>
                        <TableCell>{teacher.totalEarnings.toLocaleString()} DA</TableCell>
                        <TableCell>
                          <Badge variant="default">Excellent</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/professor/${teacher.id}`)}>
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Payment History Tab */}
          <TabsContent value="student-payments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Student Payment History
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
                  {mockStudentPaymentHistory.map((student) => (
                    <div key={student.studentId} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">{student.studentName}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {student.courses.map((course, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{course.course}</TableCell>
                              <TableCell>{course.amount} DA</TableCell>
                              <TableCell>
                                <Badge variant={course.paid ? "default" : "destructive"}>
                                  {course.paid ? "Paid" : "Unpaid"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professor Payment History Tab */}
          <TabsContent value="professor-payments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Professor Payment History
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
                  {mockProfessorPaymentHistory.map((professor) => (
                    <div key={professor.professorId} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">{professor.professorName}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {professor.sessions.map((session, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{session.course}</TableCell>
                              <TableCell>{session.students}</TableCell>
                              <TableCell>{session.amount} DA</TableCell>
                              <TableCell>
                                <Badge variant={session.paid ? "default" : "destructive"}>
                                  {session.paid ? "Paid" : "Unpaid"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
