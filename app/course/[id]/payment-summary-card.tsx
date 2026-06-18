// components/payment-summary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"

interface PaymentSummaryProps {
  course: any
  teacherEarnings: number
  onToggleTeacherPayment: () => void
}

export function PaymentSummaryCard({ course, teacherEarnings, onToggleTeacherPayment }: PaymentSummaryProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-md">
          <DollarSign className="h-5 w-5 mr-2" /> Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Teacher Payment</Label>
          <Button variant={course?.payments?.teacherPaid ? "default" : "destructive"} size="sm" onClick={onToggleTeacherPayment}>
            {course?.payments?.teacherPaid ? "Paid" : "Pay"}
          </Button>
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Revenue:</span>
            <span className="text-lg font-bold">{(course?.price || 0) * (course?.student_ids?.length || 0)} DA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Teacher Earnings:</span>
            <span className="text-lg font-bold text-green-600">{teacherEarnings} DA</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}