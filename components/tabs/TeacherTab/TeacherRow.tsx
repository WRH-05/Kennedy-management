"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, MoreHorizontal, Pencil } from "lucide-react"
import { Teacher } from "@/services/teacherService"

interface TeacherRowProps {
    teacher: Teacher
    pendingArchiveIds: Set<string>
    onArchive: (id: string, name: string) => void
}

export function TeacherRow({ teacher, pendingArchiveIds, onArchive }: TeacherRowProps) {
    const router = useRouter()
    const isPendingArchive = pendingArchiveIds.has(teacher.id)

    const subjects = [
        ...new Set(
            teacher.teachers_course_eligibility.flatMap((eligibility) =>
                eligibility.course_eligibility.courses.name
                    ? [eligibility.course_eligibility.courses.name]
                    : []
            )
        )
    ];
    const schoolYears = [
        ...new Set(
            teacher.teachers_course_eligibility.flatMap((eligibility) => {
                return eligibility.course_eligibility.grade_levels?.name
                    ? [eligibility.course_eligibility.grade_levels.name]
                    : []
            })
        )
    ];


    return (
        <TableRow className="group">
            <TableCell className="font-medium">
                <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-left"
                    onClick={() => router.push(`/teacher/${teacher.id}`)}
                >
                    {teacher.name}
                </Button>
            </TableCell>

            <TableCell>
                {subjects.length > 0 ? (
                    subjects.filter(Boolean).map((subject: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="mr-1">
                            {subject.trim()}
                        </Badge>
                    ))
                ) : (
                    <span className="text-gray-500">No subjects</span>
                )}
            </TableCell>

            <TableCell>{teacher.school}</TableCell>

            <TableCell>
                {schoolYears.length > 0 && schoolYears ? (
                    schoolYears.filter(Boolean).map((year, idx: number) => (
                        <Badge key={idx} variant="outline" className="mr-1">
                            {year?.trim()}
                        </Badge>
                    ))
                ) : (
                    <span className="text-gray-500">No school years</span>
                )}
            </TableCell>

            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/teacher/${teacher.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onArchive(teacher.id, teacher.name)}
                            className={isPendingArchive ? "text-gray-400 cursor-not-allowed" : "text-orange-600"}
                            disabled={isPendingArchive}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            {isPendingArchive ? "Archive Pending" : "Archive"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}