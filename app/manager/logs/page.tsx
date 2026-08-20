"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useActivityLogs } from "@/hooks/useActivityLogs"
import SummaryCards from "@/components/dashboard/SummaryCards"
import { Search } from "lucide-react"

const CATEGORIES = [
  { value: "all", label: "All Logs" },
  { value: "payments", label: "Payments & Payouts" },
  { value: "registrations", label: "Registrations" },
  { value: "archives", label: "Archives & Unarchives" },
  { value: "deletions", label: "Permanent Deletions" },
  { value: "expenses", label: "Expenses" },
]

const DATE_RANGES = [
  { value: "last24h", label: "Last 24 Hours" },
  { value: "last30", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "allTime", label: "All Time" },
]

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getCategoryInfo(actionType: string): { label: string; className: string } {
  switch (actionType) {
    case "payment":
      return { label: "Payment", className: "bg-emerald-100 text-emerald-800" }
    case "payout":
    case "payout_request":
    case "payout_confirmed":
      return { label: "Payout", className: "bg-amber-100 text-amber-800" }
    case "student_registration":
    case "teacher_registration":
      return { label: "Registration", className: "bg-sky-100 text-sky-800" }
    case "archive_request":
    case "archive_approved":
    case "archive_rejected":
      return { label: "Archive", className: "bg-purple-100 text-purple-800" }
    case "unarchive":
      return { label: "Unarchive", className: "bg-purple-100 text-purple-800" }
    case "permanent_delete":
    case "course_delete":
    case "grade_level_delete":
      return { label: "Deletion", className: "bg-rose-100 text-rose-800" }
    case "course_instance_created":
      return { label: "Class Created", className: "bg-indigo-100 text-indigo-800" }
    case "expense_added":
    case "expense_deleted":
      return { label: "Expense", className: "bg-orange-100 text-orange-800" }
    default:
      return { label: actionType, className: "bg-gray-100 text-gray-800" }
  }
}

function LogsDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filterCategory = searchParams.get("category") || "all"
  const dateRange = searchParams.get("range") || "last30"
  const searchQuery = searchParams.get("q") || ""

  const [searchInput, setSearchInput] = useState(searchQuery)

  const { logs, isLoading } = useActivityLogs(filterCategory, dateRange, searchQuery)

  // Keep a ref to the latest searchParams so the debounced search never uses stale values.
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      const isDefault =
        (key === "category" && value === "all") ||
        (key === "range" && value === "last30") ||
        (key === "q" && value === "")
      if (isDefault) params.delete(key)
      else params.set(key, value)
      const qs = params.toString()
      router.replace(qs ? `/manager/logs?${qs}` : "/manager/logs", { scroll: false })
    },
    [router]
  )

  // Debounce the search box into the `q` URL param.
  useEffect(() => {
    const timer = setTimeout(() => updateParam("q", searchInput), 200)
    return () => clearTimeout(timer)
  }, [searchInput, updateParam])

  // Keep the search box in sync when Back/Forward changes the URL.
  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  return (
    <div className="space-y-6">
      <SummaryCards />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterCategory} onValueChange={(value) => updateParam("category", value)}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={(value) => updateParam("range", value)}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search names or actions..."
                className="pl-8 h-9 w-[220px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Amount (DA)</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Loading logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No activity recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const cat = getCategoryInfo(log.action_type)
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatTimestamp(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge className={cat.className}>{cat.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{log.title}</div>
                          {log.description && (
                            <div className="text-xs text-muted-foreground">{log.description}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {log.amount ? `${log.amount.toLocaleString()} DA` : "-"}
                        </TableCell>
                        <TableCell>{log.actor_name || "-"}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LogsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading logs...</div>}>
      <LogsDashboard />
    </Suspense>
  )
}
