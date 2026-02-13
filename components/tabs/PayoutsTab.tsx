"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DollarSign, Check, X, MoreHorizontal } from "lucide-react"

interface PayoutsTabProps {
  payouts: any[]
  onApprovePayout: (payoutId: number) => void
  onDenyPayout?: (payoutId: number) => void
  isManager?: boolean
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

export default function PayoutsTab({ payouts, onApprovePayout, onDenyPayout, isManager = true }: PayoutsTabProps) {
  const router = useRouter()

  const pendingPayouts = payouts.filter(p => p.status === 'pending')
  const processedPayouts = payouts.filter(p => p.status !== 'pending')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Teacher Payouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="max-h-[455px] overflow-auto scrollbar-thin">
          {/* Pending Payouts */}
          <div>
            <h3 className="text-lg font-medium mb-4">Pending Payouts</h3>
            {pendingPayouts.length > 0 ? (
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
                  {pendingPayouts.map((payout: any, index: number) => {
                    const dateTime = formatDateTime(payout.created_at || payout.payment_date)
                    return (
                      <TableRow key={index} className="group">
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
                          <div className="flex items-center justify-between">
                            <Badge variant="destructive">Pending</Badge>
                            {isManager && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => onApprovePayout(payout.id)}
                                    className="text-green-600"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  {onDenyPayout && (
                                    <DropdownMenuItem
                                      onClick={() => onDenyPayout(payout.id)}
                                      className="text-red-600"
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
            ) : (
              <div className="text-center py-8 text-gray-600">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending payouts</p>
              </div>
            )}
          </div>

          {/* Payout History */}
          {processedPayouts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Payout History</h3>
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
                  {processedPayouts.map((payout: any, index: number) => {
                    const dateTime = formatDateTime(payout.created_at || payout.payment_date)
                    return (
                      <TableRow key={index} className="opacity-60">
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
                            {payout.status === 'approved' || payout.status === 'paid' ? "Paid" : payout.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
