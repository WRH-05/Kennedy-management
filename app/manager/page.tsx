"use client"
<<<<<<< HEAD

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, DollarSign, Users, BookOpen, TrendingUp, Calendar, Search, Settings, RefreshCw, AlertTriangle } from "lucide-react"
import { paymentService, archiveService, billingService } from "@/services/appDataService"
import { useAuth } from "@/contexts/AuthContext"
import AuthGuard from "@/components/auth/AuthGuard"
import StudentsTab from "@/components/tabs/StudentsTab"
import TeachersTab from "@/components/tabs/TeachersTab"
import CoursesTab from "@/components/tabs/CoursesTab"
import ArchiveTab from "@/components/tabs/ArchiveTab"
import RevenueTab from "@/components/tabs/RevenueTab"
import PayoutsTab from "@/components/tabs/PayoutsTab"
import UserManagementTab from "@/components/tabs/UserManagementTab"
import OutstandingTab from "@/components/tabs/OutstandingTab"
import { useDashboardData, usePayments, revalidateData } from "@/hooks/useData"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ManagerDashboard() {
  const router = useRouter()
  const { user, signOut, hasRole } = useAuth()
  const { toast } = useToast()
  
  // Use SWR hooks for cached data fetching
  const { students: allStudents, teachers: allTeachers, courses: allCourses, isLoading, refreshAll } = useDashboardData()
  const { payments: allPayments, mutate: mutatePayments } = usePayments()
  
  const [revenue, setRevenue] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [allPayoutsForTotal, setAllPayoutsForTotal] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState("2024-01")
  const [pendingArchiveIds, setPendingArchiveIds] = useState<{
    student: Set<string>
    teacher: Set<string>
    course: Set<string>
  }>({ student: new Set(), teacher: new Set(), course: new Set() })

  // Billing period state
  const [currentPeriod, setCurrentPeriod] = useState<any>(null)
  const [outstandingData, setOutstandingData] = useState<any>({
    studentPayments: [],
    teacherPayouts: [],
    totalStudentAmount: 0,
    totalTeacherAmount: 0
  })
  const [outstandingLoading, setOutstandingLoading] = useState(false)
  const [showRolloverDialog, setShowRolloverDialog] = useState(false)
  const [rolloverSummary, setRolloverSummary] = useState<any>(null)
  const [isRollingOver, setIsRollingOver] = useState(false)

  // Filter out archived items with memoization for performance
  const students = useMemo(() => 
    (allStudents || []).filter((student: any) => !student.archived), 
    [allStudents]
  )
  const teachers = useMemo(() => 
    (allTeachers || []).filter((teacher: any) => !teacher.archived), 
    [allTeachers]
  )
  const courses = useMemo(() => 
    (allCourses || []).filter((course: any) => !course.archived), 
    [allCourses]
  )

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")

  const handleSignOut = async () => {
    await signOut()
    // signOut handles the redirect internally
  }

  // Load revenue and payouts data (these don't have SWR hooks yet)
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        // Use Promise.allSettled to ensure all promises complete even if some fail
        const results = await Promise.allSettled([
          paymentService.getRevenueData(),
          paymentService.getAllPayouts(),
          archiveService.getPendingArchiveEntityIds(),
          billingService.getCurrentPeriod(),
          billingService.getOutstandingItems(),
        ])

        // Extract data from settled promises, using empty arrays/objects as fallback
        const revenueData = results[0].status === 'fulfilled' ? results[0].value : []
        const allPayoutsData = results[1].status === 'fulfilled' ? results[1].value : []
        const pendingArchiveMap = results[2].status === 'fulfilled' ? results[2].value : { student: new Set(), teacher: new Set(), course: new Set() }
        const periodData = results[3].status === 'fulfilled' ? results[3].value : null
        const outstandingItems = results[4].status === 'fulfilled' ? results[4].value : { studentPayments: [], teacherPayouts: [], totalStudentAmount: 0, totalTeacherAmount: 0 }

        setRevenue(revenueData || [])
        // Show all payouts in the PayoutsTab, not just pending ones
        setPayouts(allPayoutsData || [])
        setAllPayoutsForTotal(allPayoutsData || [])
        setPendingArchiveIds(pendingArchiveMap)
        setCurrentPeriod(periodData)
        setOutstandingData(outstandingItems)
      } catch (error) {
        console.error('Error loading payment data:', error)
      }
    }

    loadPaymentData()
  }, [])

  const approvePayment = async (paymentId: string, paymentType: string) => {
    try {
      const approverName = user?.profile?.full_name || 'Manager'
      await paymentService.updatePaymentStatus(paymentId, 'approved', approverName as string | null)
      // Revalidate payments cache
      mutatePayments()
    } catch (error) {
      // Error approving payment
    }
  }

  // Enhanced search functionality - using useMemo to prevent infinite loops
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    
    const studentResults = students
      .filter((student) => student.name?.toLowerCase().includes(query))
      .map((student) => ({ ...student, type: "student" }))

    const teacherResults = teachers
      .filter((teacher) => teacher.name?.toLowerCase().includes(query))
      .map((teacher) => ({ ...teacher, type: "teacher" }))

    const courseResults = courses
      .filter(
        (course) =>
          course.subject?.toLowerCase().includes(query) ||
          course.school_year?.toLowerCase().includes(query) ||
          course.teacher_name?.toLowerCase().includes(query),
      )
      .map((course) => ({ ...course, type: "course" }))

    return [...studentResults, ...teacherResults, ...courseResults]
  }, [searchQuery, students, teachers, courses])

  const showSearchResults = searchQuery.trim().length > 0 && searchResults.length > 0

  const handleSearchResultClick = (result: any) => {
    if (result.type === "student") {
      router.push(`/student/${result.id}`)
    } else if (result.type === "teacher") {
      router.push(`/teacher/${result.id}`)
    } else if (result.type === "course") {
      router.push(`/course/${result.id}`)
    }
    setSearchQuery("") // This will also clear search results since they're derived from searchQuery
  }

  const approvePayout = async (payoutId: number) => {
    try {
      const approverName = user?.profile?.full_name || 'Manager'
      await paymentService.updatePayoutStatus(payoutId.toString(), 'approved', approverName as string | null)
      // Refresh payouts data
      const updatedPayouts = await paymentService.getAllPayouts()
      setPayouts(updatedPayouts || [])
      setAllPayoutsForTotal(updatedPayouts || [])
    } catch (error) {
      console.error('Error approving payout:', error)
    }
  }

  const denyPayout = async (payoutId: number) => {
    try {
      await paymentService.deletePayout(payoutId.toString())
      // Refresh payouts data
      const updatedPayouts = await paymentService.getAllPayouts()
      setPayouts(updatedPayouts || [])
      setAllPayoutsForTotal(updatedPayouts || [])
      // Also refresh outstanding items
      const outstanding = await billingService.getOutstandingItems()
      setOutstandingData(outstanding)
    } catch (error) {
      console.error('Error denying payout:', error)
    }
  }

  // Outstanding item handlers
  const refreshOutstandingItems = async () => {
    setOutstandingLoading(true)
    try {
      const outstanding = await billingService.getOutstandingItems()
      setOutstandingData(outstanding)
    } catch (error) {
      console.error('Error refreshing outstanding items:', error)
    } finally {
      setOutstandingLoading(false)
    }
  }

  const handleMarkOutstandingPaid = async (itemId: string, itemType: 'student_payment' | 'teacher_payout') => {
    try {
      const approverName = user?.profile?.full_name || 'Manager'
      if (itemType === 'student_payment') {
        await paymentService.updatePaymentStatus(itemId, 'paid', approverName)
      } else {
        await paymentService.updatePayoutStatus(itemId, 'approved', approverName)
      }
      // Refresh all relevant data
      await refreshOutstandingItems()
      const updatedPayouts = await paymentService.getAllPayouts()
      setPayouts(updatedPayouts || [])
      setAllPayoutsForTotal(updatedPayouts || [])
    } catch (error) {
      console.error('Error marking item as paid:', error)
      throw error
    }
  }

  const handleCancelOutstanding = async (itemId: string, itemType: 'student_payment' | 'teacher_payout') => {
    try {
      if (itemType === 'student_payment') {
        await paymentService.updatePaymentStatus(itemId, 'cancelled', null)
      } else {
        await paymentService.deletePayout(itemId)
      }
      // Refresh all relevant data
      await refreshOutstandingItems()
      const updatedPayouts = await paymentService.getAllPayouts()
      setPayouts(updatedPayouts || [])
      setAllPayoutsForTotal(updatedPayouts || [])
    } catch (error) {
      console.error('Error cancelling item:', error)
      throw error
    }
  }

  // Monthly rollover handlers
  const handleShowRolloverDialog = async () => {
    try {
      const summary = await billingService.getRolloverSummary()
      setRolloverSummary(summary)
      setShowRolloverDialog(true)
    } catch (error) {
      console.error('Error getting rollover summary:', error)
      toast({
        title: "Error",
        description: "Failed to load rollover summary.",
        variant: "destructive",
      })
    }
  }

  const handleStartNewPeriod = async () => {
    setIsRollingOver(true)
    try {
      const result = await billingService.startNewPeriod()
      setCurrentPeriod(result.period)
      setShowRolloverDialog(false)
      
      // Refresh all data
      await refreshOutstandingItems()
      const updatedPayouts = await paymentService.getAllPayouts()
      setPayouts(updatedPayouts || [])
      setAllPayoutsForTotal(updatedPayouts || [])
      
      toast({
        title: "New billing period started",
        description: `Created ${result.studentsCount} billing records for ${result.coursesCount} courses.`,
      })
    } catch (error) {
      const errorMessage = (error as Error).message
      if (errorMessage === 'PERIOD_ALREADY_EXISTS') {
        toast({
          title: "Period already exists",
          description: "A billing period for this month already exists.",
          variant: "destructive",
        })
      } else {
        console.error('Error starting new period:', error)
        toast({
          title: "Error",
          description: "Failed to start new billing period.",
          variant: "destructive",
        })
      }
    } finally {
      setIsRollingOver(false)
    }
  }

  const totalRevenue = revenue.reduce((sum: number, item: any) => sum + (item.paid && item.amount ? item.amount : 0), 0)
  const totalPayouts = allPayoutsForTotal.reduce((sum: number, payout: any) => sum + ((payout.status === 'approved' || payout.status === 'paid') && payout.amount ? payout.amount : 0), 0)
  const netProfit = totalRevenue - totalPayouts

  if (isLoading) return null

=======
import SummaryCards from "@/components/dashboard/SummaryCards"
import Link from "next/link"
import { ArrowRight, Users, BookOpen, DollarSign, Archive, LibraryBig, Banknote  } from "lucide-react"
export default function DashboardHubPage() {
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607
  return (
    <div className="space-y-8">
      {/* Show the global metrics at the top */}

<<<<<<< HEAD
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
              <Button onClick={() => refreshAll()} variant="outline" size="sm" title="Refresh data">
                <RefreshCw className="h-4 w-4" />
              </Button>
              {/* Period Indicator */}
              {currentPeriod && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {currentPeriod.period_name}
                </Badge>
              )}
              <Button onClick={handleShowRolloverDialog} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                {currentPeriod ? 'New Period' : 'Start Billing Period'}
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
=======
      {/* Grid of quick navigation shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/manager/students" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /> Manage Students</h3>
            <p className="text-sm text-gray-500">View directories and status mappings</p>
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/manager/teachers" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-500" /> Manage Teachers</h3>
            <p className="text-sm text-gray-500">Track assignments and payouts</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

<<<<<<< HEAD
        <Tabs defaultValue="outstanding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="outstanding" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Outstanding
              {(outstandingData.studentPayments.length + outstandingData.teacherPayouts.length) > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {outstandingData.studentPayments.length + outstandingData.teacherPayouts.length}
                </Badge>
              )}
            </TabsTrigger>
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

          {/* Outstanding Tab */}
          <TabsContent value="outstanding">
            <OutstandingTab
              studentPayments={outstandingData.studentPayments}
              teacherPayouts={outstandingData.teacherPayouts}
              totalStudentAmount={outstandingData.totalStudentAmount}
              totalTeacherAmount={outstandingData.totalTeacherAmount}
              onMarkPaid={handleMarkOutstandingPaid}
              onCancel={handleCancelOutstanding}
              onRefresh={refreshOutstandingItems}
              isLoading={outstandingLoading}
            />
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <RevenueTab revenue={revenue} />
          </TabsContent>
=======
        <Link href="/manager/revenue" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-amber-500" /> Financial Logs</h3>
            <p className="text-sm text-gray-500">Review revenue collections</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/manager/courses" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><LibraryBig className="h-5 w-5 text-red-500" /> Manange Courses</h3>
            <p className="text-sm text-gray-500">Edit courses</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
>>>>>>> aea348a3ffc8d0229fd536ba1b80736c470b1607

        <Link href="/manager/archive" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Archive className="h-5 w-5 text-amber-800" /> Manange Archives</h3>
            <p className="text-sm text-gray-500">Check Archives</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/manager/payouts" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Banknote className="h-5 w-5 text-green-700" /> Manange Payouts</h3>
            <p className="text-sm text-gray-500">Time for money baby</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Rollover Confirmation Dialog */}
      <AlertDialog open={showRolloverDialog} onOpenChange={setShowRolloverDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {currentPeriod ? 'Start New Billing Period' : 'Initialize Billing Period'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {rolloverSummary && (
                  <>
                    {currentPeriod && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700">Current Period</p>
                        <p className="text-lg font-bold">{currentPeriod.period_name}</p>
                      </div>
                    )}

                    {(rolloverSummary.outstandingStudentPayments > 0 || rolloverSummary.outstandingTeacherPayouts > 0) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-800">Outstanding Items</p>
                            <p className="text-sm text-orange-700">
                              {rolloverSummary.outstandingStudentPayments} unpaid student payments and{' '}
                              {rolloverSummary.outstandingTeacherPayouts} pending teacher payouts will remain in Outstanding until resolved.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-700">New Period Preview</p>
                      <div className="mt-2 space-y-1 text-sm text-blue-900">
                        <p>{rolloverSummary.activeCourses} active courses</p>
                        <p>{rolloverSummary.enrolledStudents} enrolled students</p>
                        <p>{rolloverSummary.totalBillingRecordsToCreate} billing records will be created</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      This will create pending payment records for all enrolled students and reset attendance tracking for the new month.
                    </p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRollingOver}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartNewPeriod} disabled={isRollingOver}>
              {isRollingOver ? 'Starting...' : 'Start New Period'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}