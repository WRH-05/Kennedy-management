"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, DollarSign, Users, Clock, Check, X, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OutstandingItem {
  type: 'student_payment' | 'teacher_payout'
  id: string
  entityId: string
  entityName: string
  courseId?: string | null
  courseName?: string | null
  amount: number
  month: string
  status: string
  createdAt: string
  billingPeriodId?: string
  enrollmentStatus?: string
  percentage?: number
  daysOverdue: number
}

interface OutstandingTabProps {
  studentPayments: OutstandingItem[]
  teacherPayouts: OutstandingItem[]
  totalStudentAmount: number
  totalTeacherAmount: number
  onMarkPaid: (itemId: string, itemType: 'student_payment' | 'teacher_payout') => Promise<void>
  onCancel: (itemId: string, itemType: 'student_payment' | 'teacher_payout') => Promise<void>
  onRefresh: () => Promise<void>
  isLoading?: boolean
}

// Helper function to format date
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return 'N/A'
  }
}

// Get badge variant based on days overdue
const getOverdueBadgeVariant = (days: number): "default" | "secondary" | "destructive" | "outline" => {
  if (days > 30) return "destructive"
  if (days > 14) return "secondary"
  return "outline"
}

export default function OutstandingTab({
  studentPayments,
  teacherPayouts,
  totalStudentAmount,
  totalTeacherAmount,
  onMarkPaid,
  onCancel,
  onRefresh,
  isLoading = false
}: OutstandingTabProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleMarkPaid = async (itemId: string, itemType: 'student_payment' | 'teacher_payout') => {
    setProcessingId(itemId)
    try {
      await onMarkPaid(itemId, itemType)
      toast({
        title: "Payment recorded",
        description: "The item has been marked as paid.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as paid.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancel = async (itemId: string, itemType: 'student_payment' | 'teacher_payout') => {
    setProcessingId(itemId)
    try {
      await onCancel(itemId, itemType)
      toast({
        title: "Item cancelled",
        description: "The payment has been cancelled.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel item.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const totalOutstanding = totalStudentAmount + totalTeacherAmount
  const totalItems = studentPayments.length + teacherPayouts.length

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Outstanding Payments
            </CardTitle>
            <CardDescription className="mt-1">
              {totalItems} items totaling {totalOutstanding.toLocaleString()} DA
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center text-blue-700">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Student Payments</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-blue-900">
              {totalStudentAmount.toLocaleString()} DA
            </div>
            <div className="text-sm text-blue-600">{studentPayments.length} pending</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center text-purple-700">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Teacher Payouts</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-purple-900">
              {totalTeacherAmount.toLocaleString()} DA
            </div>
            <div className="text-sm text-purple-600">{teacherPayouts.length} pending</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Unpaid Students ({studentPayments.length})
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Pending Payouts ({teacherPayouts.length})
            </TabsTrigger>
          </TabsList>

          {/* Student Payments Tab */}
          <TabsContent value="students">
            <div className="max-h-[400px] overflow-auto scrollbar-thin">
              {studentPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentPayments.map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/student/${item.entityId}`)}
                          >
                            {item.entityName}
                          </Button>
                          {item.enrollmentStatus && item.enrollmentStatus !== 'full_month' && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {item.enrollmentStatus.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.courseId ? (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-left"
                              onClick={() => router.push(`/course/${item.courseId}`)}
                            >
                              {item.courseName}
                            </Button>
                          ) : (
                            item.courseName || 'N/A'
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {(item.amount || 0).toLocaleString()} DA
                        </TableCell>
                        <TableCell>{item.month}</TableCell>
                        <TableCell>
                          <Badge variant={getOverdueBadgeVariant(item.daysOverdue)}>
                            <Clock className="h-3 w-3 mr-1" />
                            {item.daysOverdue} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleMarkPaid(item.id, 'student_payment')}
                              disabled={processingId === item.id}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancel(item.id, 'student_payment')}
                              disabled={processingId === item.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No unpaid student payments</p>
                  <p className="text-sm">All students are up to date with their payments.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Teacher Payouts Tab */}
          <TabsContent value="teachers">
            <div className="max-h-[400px] overflow-auto scrollbar-thin">
              {teacherPayouts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherPayouts.map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => router.push(`/teacher/${item.entityId}`)}
                          >
                            {item.entityName}
                          </Button>
                        </TableCell>
                        <TableCell>{item.percentage || 'N/A'}%</TableCell>
                        <TableCell className="font-medium">
                          {(item.amount || 0).toLocaleString()} DA
                        </TableCell>
                        <TableCell>{item.month}</TableCell>
                        <TableCell>
                          <Badge variant={getOverdueBadgeVariant(item.daysOverdue)}>
                            <Clock className="h-3 w-3 mr-1" />
                            {item.daysOverdue} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleMarkPaid(item.id, 'teacher_payout')}
                              disabled={processingId === item.id}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancel(item.id, 'teacher_payout')}
                              disabled={processingId === item.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No pending teacher payouts</p>
                  <p className="text-sm">All teachers have been paid for this period.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
