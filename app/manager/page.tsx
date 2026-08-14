"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getAuthorizedNavigation } from "@/lib/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTodaySchedule } from "@/hooks/useCourseInstances"

type ScheduleStatus = "upcoming" | "in-progress" | "completed"

function getScheduleStatus(startTime: string, endTime: string): ScheduleStatus {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const [sH, sM] = startTime.split(":").map(Number)
  const [eH, eM] = endTime.split(":").map(Number)
  const start = (sH || 0) * 60 + (sM || 0)
  const end = (eH || 0) * 60 + (eM || 0)
  if (nowMinutes < start) return "upcoming"
  if (nowMinutes <= end) return "in-progress"
  return "completed"
}

function TodayScheduleCard() {
  const { schedule, isLoading } = useTodaySchedule()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="h-5 w-5 mr-2" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : schedule.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {schedule.map((item) => {
              const status = getScheduleStatus(item.startTime, item.endTime)
              return (
                <div key={`${item.courseInstanceId}-${item.startTime}`} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/course-instance/${item.courseInstanceId}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {item.displayName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{item.teacherName}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm tabular-nums">{item.startTime} - {item.endTime}</span>
                    {status === "upcoming" && <Badge variant="secondary">Upcoming</Badge>}
                    {status === "in-progress" && <Badge variant="default">In Progress</Badge>}
                    {status === "completed" && <Badge variant="outline" className="text-muted-foreground">Completed</Badge>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardHubPage() {
  const { user, profile, loading } = useAuth()
  const role = profile?.role // Use DB profile role (not JWT claim which may be missing)

  // 2. Filter down cards to only show what the current role is authorized to view
  const authorizedCards = getAuthorizedNavigation(role)

  // 3. Handle loading state gracefully to avoid layout shifts or a flashing blank page
  if (loading || (!role && !user)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-lg border border-gray-200" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <TodayScheduleCard />

      {/* Grid of quick navigation shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {authorizedCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center"
          >
            <div className="space-y-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {card.icon} {card.title}
              </h3>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  )
}
