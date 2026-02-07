"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"

interface PayoutsTabProps {
  payouts: any[]
  onApprovePayout: (payoutId: number) => void
}

export default function PayoutsTab({ payouts, onApprovePayout }: PayoutsTabProps) {
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
              <TableHead>Total Generated</TableHead>
              <TableHead>Total Payout</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{payout.professor_name || 'N/A'}</TableCell>
                <TableCell>{payout.percentage || 'N/A'}%</TableCell>
                <TableCell>{(payout.total_generated || 0).toLocaleString()} DA</TableCell>
                <TableCell>{(payout.amount || 0).toLocaleString()} DA</TableCell>
                <TableCell>{payout.due_date || payout.month || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={payout.status === 'approved' ? "default" : "destructive"}>
                    {payout.status === 'approved' ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payout.status !== 'approved' && (
                    <Button variant="outline" size="sm" onClick={() => onApprovePayout(payout.id)}>
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  )
}
