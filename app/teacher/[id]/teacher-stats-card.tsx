import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeacherStatsCardProps {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  completedCourses: number
  totalPayouts: number
}

export function TeacherStatsCard({ totalCourses, activeCourses, totalStudents, completedCourses, totalPayouts }: TeacherStatsCardProps) {
  const statsConfig = [
    { label: "Total Classes", count: totalCourses, format: false },
    { label: "Active Classes", count: activeCourses, format: false },
    { label: "Total Students", count: totalStudents, format: false },
    { label: "Completed Classes", count: completedCourses, format: false },
    { label: "Total Payouts Received (DA)", count: totalPayouts, format: true },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Performance Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {statsConfig.map((stat, i) => (
            <div key={i} className={`rounded-lg border p-3 ${i === statsConfig.length - 1 ? "col-span-2" : ""}`}>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.format ? stat.count.toLocaleString() : stat.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
