import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeacherStatsCardProps {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  completedCourses: number
}

export function TeacherStatsCard({ totalCourses, activeCourses, totalStudents, completedCourses }: TeacherStatsCardProps) {
  const statsConfig = [
    { label: "Total courseInstances", count: totalCourses, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Active courseInstances", count: activeCourses, bg: "bg-green-50", text: "text-green-600" },
    { label: "Total Students", count: totalStudents, bg: "bg-purple-50", text: "text-purple-600" },
    { label: "Completed courseInstances", count: completedCourses, bg: "bg-orange-50", text: "text-orange-600" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statsConfig.map((stat, i) => (
          <div key={i} className={`text-center p-4 ${stat.bg} rounded-lg`}>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.text}`}>{stat.count}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}