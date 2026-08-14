"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, DollarSign, Users, Wallet, BarChart3, Loader2, Receipt, GraduationCap, BookOpen, type LucideIcon } from "lucide-react"
import { useStats } from "@/hooks/useStats"
import { DateRangeKey, StatsData } from "@/services/statsService"

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "last30", label: "Last 30 Days" },
  { key: "thisCycle", label: "This Cycle" },
  { key: "allTime", label: "All Time" },
]

const RANGE_LABEL: Record<DateRangeKey, string> = {
  last30: "Last 30 days",
  thisCycle: "This cycle",
  allTime: "All time",
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString()
}

function KpiCard({ title, icon: Icon, value, currency, caption }: {
  title: string
  icon: LucideIcon
  value: number
  currency?: boolean
  caption: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}{currency ? " DA" : ""}</div>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  )
}

function TopClassesCard({ stats }: { stats: StatsData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm font-medium">
          <GraduationCap className="h-5 w-5 mr-2" />
          Class Popularity & Capacity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.topClasses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topClasses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.teacher}</TableCell>
                  <TableCell>{c.enrolled}</TableCell>
                  <TableCell>{c.capacity ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-8 text-gray-600">No active class instances.</p>
        )}
      </CardContent>
    </Card>
  )
}

function BreakdownCard({ stats }: { stats: StatsData }) {
  const fixedTotal = stats.fixedSalaryPayouts + stats.percentagePayouts
  const fixedPct = fixedTotal > 0 ? Math.round((stats.fixedSalaryPayouts / fixedTotal) * 100) : 0
  const regTotal = stats.registrationPaidCount + stats.registrationUnpaidCount
  const regPct = regTotal > 0 ? Math.round((stats.registrationPaidCount / regTotal) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm font-medium">
          <Receipt className="h-5 w-5 mr-2" />
          Financial & Registration Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Registration vs Tuition</h4>
          <div className="flex justify-between text-sm">
            <span>Registration Fees ({stats.registrationPaidCount} students)</span>
            <span className="font-semibold">{stats.registrationFees.toLocaleString()} DA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tuition Revenue</span>
            <span className="font-semibold">{stats.tuitionRevenue.toLocaleString()} DA</span>
          </div>
          <Progress value={regPct} />
          <p className="text-xs text-muted-foreground">{regPct}% of students have paid registration</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Teacher Compensation</h4>
          <div className="flex justify-between text-sm">
            <span>Fixed Salary</span>
            <span className="font-semibold">{stats.fixedSalaryPayouts.toLocaleString()} DA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Percentage Share</span>
            <span className="font-semibold">{stats.percentagePayouts.toLocaleString()} DA</span>
          </div>
          <Progress value={fixedPct} />
          <p className="text-xs text-muted-foreground">{fixedPct}% fixed salary / {100 - fixedPct}% percentage share</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StudentDistributionCard({ stats }: { stats: StatsData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm font-medium">
          <BarChart3 className="h-5 w-5 mr-2" />
          Student Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Active Enrolled</p>
            <p className="text-lg font-bold">{stats.activeEnrolled}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Dropped</p>
            <p className="text-lg font-bold">{stats.droppedStudents}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentCollectionsCard({ stats }: { stats: StatsData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm font-medium">
          <DollarSign className="h-5 w-5 mr-2" />
          Recent Collections
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.recentCollections.length > 0 ? (
          <ul className="space-y-3">
            {stats.recentCollections.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{c.student_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.payment_date)}</p>
                </div>
                <span className="font-semibold">{c.amount.toLocaleString()} DA</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-8 text-gray-600">No collections in this range.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function StatsPage() {
  const [range, setRange] = useState<DateRangeKey>("allTime")
  const { stats, isLoading } = useStats(range)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">School Analytics & Statistics</h1>
          <p className="text-sm text-muted-foreground">
            Overview of school financial health, enrollment growth, and class performance.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {RANGES.map((r) => (
            <Button
              key={r.key}
              size="sm"
              variant={range === r.key ? "default" : "ghost"}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading || !stats ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard
              title="Total Income"
              icon={TrendingUp}
              value={stats.totalIncome}
              currency
              caption={`Tuition + registration (${RANGE_LABEL[range]})`}
            />
            <KpiCard
              title="Teacher Expenses"
              icon={DollarSign}
              value={stats.teacherExpenses}
              currency
              caption={`Payouts (${RANGE_LABEL[range]})`}
            />
            <KpiCard
              title="Net Operating Profit"
              icon={Wallet}
              value={stats.netProfit}
              currency
              caption={RANGE_LABEL[range]}
            />
            <KpiCard
              title="Active Students"
              icon={Users}
              value={stats.activeStudents}
              caption="Enrolled, non-archived"
            />
            <KpiCard
              title="Total Teachers"
              icon={GraduationCap}
              value={stats.totalTeachers}
              caption="Non-archived teachers"
            />
            <KpiCard
              title="Total Courses"
              icon={BookOpen}
              value={stats.totalCourses}
              caption="All courses"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopClassesCard stats={stats} />
            <BreakdownCard stats={stats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentDistributionCard stats={stats} />
            <RecentCollectionsCard stats={stats} />
          </div>
        </>
      )}
    </div>
  )
}
