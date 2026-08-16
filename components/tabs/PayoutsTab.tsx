"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DollarSign, Check, X, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { EnrichedStudentPayments } from "@/services/studentPaymentService"
import { revalidateData } from "@/hooks/swr-config"
import { teacherPayoutService } from "@/services/teacherPayoutService"
import Link from "next/link"
import { Tables } from "@/types/database.types"
import { EnrichedTeacherPayout } from "@/services/teacherPayoutService"
import { getCourseDisplayName } from "@/lib/course-display"

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
type PayoutData = PaginatedResponse<EnrichedStudentPayments> | PaginatedResponse<EnrichedTeacherPayout>;
interface PayoutsTabProps {
  // payoutData now accepts the full response object from your service
  payoutData: PayoutData

  onPageChange?: (newPage?: number) => void // Callback to pass page changes up to your parent component
  isManager?: boolean
  type: "teacher" | "student"
}

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return { date: 'N/A', time: 'N/A' }
  try {
    const date = new Date(dateStr)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`
    }
  } catch {
    return { date: 'N/A', time: 'N/A' }
  }
}

export default function PayoutsTab({
  payoutData,
  onPageChange,
  isManager = true,
  type
}: PayoutsTabProps) {
  const router = useRouter()

  // Safely normalize whether payoutData is wrapped in the backend object structure or is a fallback array
  const payouts = payoutData.data
  const totalItems = Array.isArray(payoutData) ? payouts.length : payoutData?.total || 0
  const currentPage = Array.isArray(payoutData) ? 1 : payoutData?.page || 1
  const pageSize = Array.isArray(payoutData) ? payouts.length : payoutData?.pageSize || 10

  const pendingPayouts = payouts.filter(p => p.status === 'pending')
  const processedPayouts = payouts.filter(p => p.status !== 'pending')

  const routePrefix = type === "teacher" ? "teacher" : "student"
  const sectionTitle = type === "teacher" ? "Teacher Payouts" : "Student Cashbacks / Payouts"

  const totalPages = Math.ceil(totalItems / (pageSize || 1))
  const onApprovePayout = async (paymentId: string) => {
    try {
      await teacherPayoutService.payTeacherPayout(paymentId)
      revalidateData('teacher-payouts')
      revalidateData('payments')
      onPageChange?.()
    } catch (error) {
      console.error(error)
    }
  }
  const onDenyPayout = async (paymentId: string) => {
    try {
      await teacherPayoutService.denyTeacherPayout(paymentId)
      revalidateData('teacher-payouts')
      revalidateData('payments')
      onPageChange?.()
    } catch (error) {
      console.error(error)
    }
  }

  const renderNameCell = (payout: EnrichedStudentPayments | EnrichedTeacherPayout) => {
    // Use 'in' to check which type of payout we are dealing with
    const person = 'students' in payout ? payout.students : payout.teachers;

    // Optional chaining handle cases where the relation might be missing/null
    const id = person?.id;
    const name = person?.name ?? 'Unknown';

    if (id) {
      return (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-left"
          onClick={() => router.push(`/${routePrefix}/${id}`)}
        >
          {name}
        </Button>
      );
    }

    return name;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          {sectionTitle}
        </CardTitle>

        {/* Pagination Status indicator in Header */}
        {totalPages > 1 && (
          <div className="text-xs text-muted-foreground font-normal">
            Showing rows {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-8">

        {/* Pending Section */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-4">Pending Requests</h3>
          {pendingPayouts.length > 0 ? (
            <div className="rounded-md border max-h-112.5 overflow-auto scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead>{type === "teacher" ? "Teacher" : "Student"} Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="w-25">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayouts.map((payout, index: number) => {
                    const dateTime = formatDateTime(payout.created_at || payout.payment_date)
                    return (
                      <TableRow key={payout.id || index} className="group hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{renderNameCell(payout)}</TableCell>
                        <TableCell className="font-medium"><Link href={`/course-instance/${payout.course_instances?.id}`}>{getCourseDisplayName(payout.course_instances)}</Link></TableCell>
                        <TableCell className="font-semibold text-primary">{payout.amount.toLocaleString()} DA</TableCell>
                        <TableCell>{dateTime.date}</TableCell>
                        <TableCell>{dateTime.time}</TableCell>
                        <TableCell>{payout.profiles?.full_name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between">
                            <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600 text-white">Pending</Badge>
                            {isManager && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => onApprovePayout(payout.id)}
                                    className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  {onDenyPayout && (
                                    <DropdownMenuItem
                                      onClick={() => onDenyPayout(payout.id)}
                                      className="text-rose-600 focus:text-rose-600 cursor-pointer"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Deny
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg text-gray-400">
              <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No pending requests for this category.</p>
            </div>
          )}
        </div>

        {/* History Section */}
        {processedPayouts.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-4">Payout History</h3>
            <div className="rounded-md border max-h-112.5 overflow-auto scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead>{type === "teacher" ? "Teacher" : "Student"} Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="w-25">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedPayouts.map((payout: any, index: number) => {
                    const dateTime = formatDateTime(payout.created_at || payout.payment_date)
                    const isApproved = payout.status === 'approved' || payout.status === 'paid'
                    const isDenied = payout.status === 'cancelled'

                    return (
                      <TableRow key={payout.id || index} className="opacity-80 hover:opacity-100 transition-opacity">
                        <TableCell className="font-medium">{renderNameCell(payout)}</TableCell>
                        <TableCell className="font-medium"><Link href={`/course-instance/${payout.course_instances.id}`}>{getCourseDisplayName(payout.course_instances)}</Link></TableCell>
                        <TableCell>{(payout.amount || 0).toLocaleString()} DA</TableCell>
                        <TableCell>{dateTime.date}</TableCell>
                        <TableCell>{dateTime.time}</TableCell>
                        <TableCell>{payout.profiles.full_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={isApproved ? "default" : isDenied ? "destructive" : "secondary"}
                            className={isApproved ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}
                          >
                            {isApproved ? "Paid" : isDenied ? "Cancelled" : payout.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Dynamic Pagination Controls Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <span className="text-sm text-gray-500 mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}