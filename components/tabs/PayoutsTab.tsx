"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"

interface PayoutsTabProps {
  payouts: any[]
  onApprovePayout: (payoutId: number) => void
}

// Helper function to format date and time
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

export default function PayoutsTab({ payouts, onApprovePayout }: PayoutsTabProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Teacher Payouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[455px] overflow-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher Name</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Total Payout</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout: any, index: number) => {
              const dateTime = formatDateTime(payout.created_at || payout.payment_date)
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {payout.teacher_id ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/teacher/${payout.teacher_id}`)}
                      >
                        {payout.professor_name || 'N/A'}
                      </Button>
                    ) : (
                      payout.professor_name || 'N/A'
                    )}
                  </TableCell>
                  <TableCell>{payout.percentage || 'N/A'}%</TableCell>
                  <TableCell>{(payout.amount || 0).toLocaleString()} DA</TableCell>
                  <TableCell>{dateTime.date}</TableCell>
                  <TableCell>{dateTime.time}</TableCell>
                  <TableCell>{payout.recorded_by_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={payout.status === 'approved' || payout.status === 'paid' ? "default" : "destructive"}>
                      {payout.status === 'approved' || payout.status === 'paid' ? "Paid" : "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  )
}
