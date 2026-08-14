"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { CourseInstanceWithEnrichment } from "@/services/courseInstancesService"

export function ActiveClassInstancesCard({ instances }: { instances: CourseInstanceWithEnrichment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Active Class Instances
        </CardTitle>
      </CardHeader>
      <CardContent>
        {instances.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((ci) => (
                <TableRow key={ci.id}>
                  <TableCell className="font-medium">
                    <Link href={`/course-instance/${ci.id}`} className="hover:underline">
                      {(ci.display_name || ci.course_eligibility?.courses?.name) ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell>{ci.teachers?.name ?? "—"}</TableCell>
                  <TableCell>{ci.student_ids?.length || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-600">No active class instances</p>
        )}
      </CardContent>
    </Card>
  )
}
