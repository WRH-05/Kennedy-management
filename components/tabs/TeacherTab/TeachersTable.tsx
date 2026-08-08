import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TeacherRow } from "./TeacherRow"
import { Teacher } from "@/services/teacherService"

interface TeachersTableProps {
    teachers: Teacher[]
    pendingArchiveIds: Set<string>
    onArchive: (id: string, name: string) => void
    onTeacherUpdated: () => void
}

export function TeachersTable({ teachers, pendingArchiveIds, onArchive, onTeacherUpdated }: TeachersTableProps) {

    return (
        <div className="max-h-113.75 overflow-auto scrollbar-thin">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>School Years</TableHead>
                        <TableHead className="w-12.5"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teachers.map((teacher) => (
                        <TeacherRow
                            key={teacher.id}
                            teacher={teacher}
                            pendingArchiveIds={pendingArchiveIds}
                            onArchive={onArchive}
                            onTeacherUpdated={onTeacherUpdated}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}