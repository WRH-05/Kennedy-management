"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Archive } from "lucide-react"
import { archiveService } from "@/services/archiveService"
import { useToast } from "@/hooks/use-toast"
import { Tables } from "@/types/database.types"
import { UpdateStudentDialog } from "./UpdateStudentDialog"

interface StudentActionsMenuProps {
    studentId: string
    studentName: string
    isPendingArchive: boolean
    student: Tables<"students"> & { grade_levels?: { id: number | string; name: string } | null }
    onStudentUpdated: () => void
}

export function StudentActionsMenu({ studentId, studentName, isPendingArchive, student, onStudentUpdated }: StudentActionsMenuProps) {
    const { toast } = useToast()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const handleArchiveStudent = async () => {
        try {
            await archiveService.createArchiveRequest('student', studentId, studentName)
            toast({ title: "Archive request submitted", description: "Waiting for manager approval." })
        } catch (error) {
            console.error('Error creating archive request:', error)
            toast({ title: "Error", description: "Failed to create archive request.", variant: "destructive" })
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditDialogOpen(true) }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleArchiveStudent}
                        className={isPendingArchive ? "text-gray-400 cursor-not-allowed" : "text-orange-600"}
                        disabled={isPendingArchive}
                    >
                        <Archive className="mr-2 h-4 w-4" />
                        {isPendingArchive ? "Archive Pending" : "Archive"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <UpdateStudentDialog
                student={student}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onStudentUpdated={onStudentUpdated}
            />
        </>
    )
}
