"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface RevenueTabProps {
  revenue: any[]
}

export default function RevenueTab({ revenue }: RevenueTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Revenue Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[455px] overflow-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {revenue.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.student_name || 'N/A'}</TableCell>
                <TableCell>{item.course || 'N/A'}</TableCell>
                <TableCell>{(item.amount || 0).toLocaleString()} DA</TableCell>
                <TableCell>{item.month || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={item.paid ? "default" : "destructive"}>
                    {item.paid ? "Paid" : "Pending"}
                  </Badge>
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
