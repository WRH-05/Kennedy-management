"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface RevenueTabProps {
  revenue: any[]
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

export default function RevenueTab({ revenue }: RevenueTabProps) {
  const router = useRouter()

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
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {revenue.map((item: any, index: number) => {
              const dateTime = formatDateTime(item.created_at || item.updated_at)
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.student_id ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/student/${item.student_id}`)}
                      >
                        {item.student_name || 'N/A'}
                      </Button>
                    ) : (
                      item.student_name || 'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.course_id ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/course/${item.course_id}`)}
                      >
                        {item.course || 'N/A'}
                      </Button>
                    ) : (
                      item.course || 'N/A'
                    )}
                  </TableCell>
                  <TableCell>{(item.amount || 0).toLocaleString()} DA</TableCell>
                  <TableCell>{dateTime.date}</TableCell>
                  <TableCell>{dateTime.time}</TableCell>
                  <TableCell>{item.recorded_by_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.paid ? "default" : "destructive"}>
                      {item.paid ? "Paid" : "Pending"}
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
