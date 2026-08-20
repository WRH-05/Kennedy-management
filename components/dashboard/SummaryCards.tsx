"use client"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Receipt, Loader2 } from "lucide-react"
import { useRevenue, useTeachersPayouts } from "@/hooks/usePayments"
import { useExpenses } from "@/hooks/useExpenses"
import { UnifiedPaymentActivity } from "@/services/paymentService"
import { Tables } from "@/types/database.types"

export default function SummaryCards() {
  const { data: revenueData, isLoading: revenueLoading } = useRevenue()
  const { payments: payoutsData, isLoading: payoutLoading } = useTeachersPayouts()
  const { expenses, isLoading: expensesLoading } = useExpenses()
  const revenue = revenueData || []

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

  const totalOperationalExpenses = useMemo(() =>
    expenses.reduce((sum: number, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  )

  const netProfit = totalRevenue - (totalPayouts + totalOperationalExpenses)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {revenueLoading || payoutLoading || expensesLoading ?
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
          {revenueLoading || payoutLoading || expensesLoading ?
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
          {revenueLoading || payoutLoading || expensesLoading ?
            (<Loader2 className="h-10 w-10 text-gray-500 mx-auto animate-spin" />)
            :
            (<div className="text-2xl font-bold">{netProfit.toLocaleString()} DA</div>)
          }
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Operational Expenses</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {revenueLoading || payoutLoading || expensesLoading ?
            (<Loader2 className="h-10 w-10 text-gray-500 mx-auto animate-spin" />)
            :
            (<div className="text-2xl font-bold">{totalOperationalExpenses.toLocaleString()} DA</div>)
          }
          <p className="text-xs text-muted-foreground">Non-teacher expenditures</p>
        </CardContent>
      </Card>
    </div>
  )
}
