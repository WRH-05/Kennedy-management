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
  // Defensive extraction: payout could be an array, null, undefined, or a single object
  const existingPayout = Array.isArray(payout) ? payout[0] : (payout && payout.id ? payout : null);
  const hasPayout = Boolean(existingPayout);

  // Button is enabled when no payout exists, or status is 'cancelled' or 'unpaid'
  // 'unpaid' is the placeholder the DB creates when a billing cycle is initialized
  const isPayable = !hasPayout || existingPayout.status === 'cancelled' || existingPayout.status === 'unpaid'

  const getButtonText = () => {
    if (!hasPayout || existingPayout.status === 'cancelled' || existingPayout.status === 'unpaid') return "Create Payout"
    if (existingPayout.status === 'pending') return "Payout Requested"
    return "Payout Processed"
  }

  // Helper function to get badge styles/labels based on status
  const getStatusBadge = (status: string | undefined) => {
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
          {hasPayout ? getStatusBadge(existingPayout.status) : <Badge variant="secondary">No Payout</Badge>}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          <Label>Teacher Payment</Label>
          <Button
            disabled={!isPayable}
            variant={isPayable ? "default" : "outline"}
            size="sm"
            onClick={onToggleTeacherPayment}
          >
            {getButtonText()}
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