"use client"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Users, Loader2 } from "lucide-react"
import { useRevenue, useTeachersPayouts } from "@/hooks/usePayments"
import { useStudents } from "@/hooks/useStudents"
import { UnifiedPaymentActivity } from "@/services/paymentService"
import { Tables } from "@/types/database.types"

export default function SummaryCards() {
  const { students: allStudents, isLoading: studentLoading } = useStudents()
  const { data: revenueData, isLoading: revenueLoading } = useRevenue()
  const { payments: payoutsData, isLoading: payoutLoading } = useTeachersPayouts()
  const revenue = revenueData || []

  const students = useMemo(() =>
    (allStudents && 'data' in allStudents ? allStudents.data : []),
    [allStudents]
  )

  const payouts = useMemo(() => {
    if (payoutsData && 'data' in payoutsData) {
      return payoutsData.data
    }
    return []
  }, [payoutsData])

  const totalRevenue = useMemo(() =>
    revenue.reduce((sum: number, item: UnifiedPaymentActivity) => sum + (item.status === "paid" && item.amount ? item.amount : 0), 0),
    [revenue]
  )

  const totalPayouts = useMemo(() =>
    payouts.reduce((sum: number, payout: Tables<"teacher_payouts">) =>
      sum + ((payout.status === 'paid') && payout.amount ? payout.amount : 0),
      0
    ),
    [payouts]
  )

  const netProfit = totalRevenue - totalPayouts

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {studentLoading || revenueLoading || payoutLoading ?
            (<Loader2 className="h-10 w-10 text-gray-500 mx-auto animate-spin" />)
            :
            (<div className="text-2xl font-bold">{totalRevenue.toLocaleString()} DA</div>)
          }
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {studentLoading || revenueLoading || payoutLoading ?
            (<Loader2 className="h-10 w-10 text-gray-500 mx-auto animate-spin" />)
            :
            (<div className="text-2xl font-bold">{totalPayouts.toLocaleString()} DA</div>)
          }

          <p className="text-xs text-muted-foreground">To teachers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {studentLoading || revenueLoading || payoutLoading ?
            (<Loader2 className="h-10 w-10 text-gray-500 mx-auto animate-spin" />)
            :
            (<div className="text-2xl font-bold">{netProfit.toLocaleString()} DA</div>)
          }

          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {studentLoading || revenueLoading || payoutLoading ?
            (<Loader2 className="h-10 w-10 text-gray-500 mx-auto animate-spin" />)
            :
            (<div className="text-2xl font-bold">{students.length}</div>)
          }
          <p className="text-xs text-muted-foreground">Enrolled</p>
        </CardContent>
      </Card>
    </div>
  )
}