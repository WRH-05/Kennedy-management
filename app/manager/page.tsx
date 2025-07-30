"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, DollarSign, Users, BookOpen, TrendingUp } from "lucide-react"

// Mock data for manager view
const mockRevenue = [
  { studentName: "Ahmed Ben Ali", course: "Mathematics", amount: 3000, month: "January" },
  { studentName: "Fatima Zahra", course: "Physics", amount: 2800, month: "January" },
  { studentName: "Fatima Zahra", course: "Chemistry", amount: 2800, month: "January" },
  { studentName: "Omar Khaled", course: "Biology", amount: 2500, month: "January" },
]

const mockPayouts = [
  { teacherName: "Prof. Salim", percentage: 70, totalGenerated: 15000, totalPayout: 10500, approved: false },
  { teacherName: "Prof. Amina", percentage: 65, totalGenerated: 12000, totalPayout: 7800, approved: true },
  { teacherName: "Prof. Omar", percentage: 68, totalGenerated: 18000, totalPayout: 12240, approved: false },
]

const mockStudentData = [
  { id: 1, name: "Ahmed Ben Ali", schoolYear: "3AS", totalPaid: 3000, coursesEnrolled: 1 },
  { id: 2, name: "Fatima Zahra", schoolYear: "BAC", totalPaid: 5600, coursesEnrolled: 2 },
  { id: 3, name: "Omar Khaled", schoolYear: "2AS", totalPaid: 2500, coursesEnrolled: 1 },
]

const mockTeacherData = [
  { id: 1, name: "Prof. Salim", subjects: ["Mathematics"], students: 15, totalEarnings: 10500 },
  { id: 2, name: "Prof. Amina", subjects: ["Physics"], students: 12, totalEarnings: 7800 },
  { id: 3, name: "Prof. Omar", subjects: ["Chemistry"], students: 18, totalEarnings: 12240 },
]

export default function ManagerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [payouts, setPayouts] = useState(mockPayouts)

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

  const totalRevenue = mockRevenue.reduce((sum, item) => sum + item.amount, 0)
  const totalPayouts = payouts.reduce((sum, payout) => sum + payout.totalPayout, 0)
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
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
                          <Badge variant="default">Paid</Badge>
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
                        <TableCell className="font-medium">{student.name}</TableCell>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTeacherData.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
