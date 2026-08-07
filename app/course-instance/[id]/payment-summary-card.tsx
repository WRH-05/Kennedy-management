// components/payment-summary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge" // Recommended for clean status displaying
import { DollarSign } from "lucide-react"
import { Tables } from "@/types/database.types"

interface PaymentSummaryProps {
  teacherEarnings: number
  payout: Tables<"teacher_payouts"> | null
  onToggleTeacherPayment: () => void
}

export function PaymentSummaryCard({payout, teacherEarnings, onToggleTeacherPayment }: PaymentSummaryProps) {
  if (!payout) return null

  // The button is ONLY clickable if status is 'pending', 'unpaid', or 'cancelled'
  // It is disabled ONLY when it is already 'paid'
  const isPayable = payout.status === 'pending' || payout.status === 'unpaid' || payout.status === 'cancelled'

  // Helper function to get badge styles/labels based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Paid</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'unpaid':
      default:
        return <Badge variant="secondary">Unpaid</Badge>
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-md">
          <DollarSign className="h-5 w-5 mr-2" /> Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display Row */}
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground">Current Status</Label>
          {getStatusBadge(payout.status)}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          <Label>Teacher Payment</Label>
          <Button 
            disabled={!isPayable} 
            variant={payout.status === 'paid' ? "outline" : "default"} 
            size="sm" 
            onClick={onToggleTeacherPayment}
          >
            {payout.status === 'paid' ? "Paid" : "Pay"}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Teacher Earnings:</span>
            <span className="text-lg font-bold text-green-600">{teacherEarnings} DA</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}