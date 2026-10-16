"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Pencil, Archive, Trash2, AlertTriangle } from "lucide-react"
import { archiveService } from "@/services/archiveService"
import { studentService } from "@/services/studentService"
import { revalidateData } from "@/hooks/swr-config"
import { useAuth } from "@/context/AuthContext"
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
    const { profile } = useAuth()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    // Purging a profile together with everything recorded against it is irreversible
    // and rewrites financial history, so it is the owner's to make and nobody else's.
    const isOwner = profile?.role === 'owner'

    const [isForceDeleteOpen, setIsForceDeleteOpen] = useState(false)
    const [forceDeleteReason, setForceDeleteReason] = useState("")
    const [isForceDeleting, setIsForceDeleting] = useState(false)

    const handleArchiveStudent = async () => {
        try {
            await archiveService.createArchiveRequest('student', studentId, studentName)
            toast({ title: "Archive request submitted", description: "Waiting for manager approval." })
        } catch (error) {
            console.error('Error creating archive request:', error)
            toast({ title: "Error", description: "Failed to create archive request.", variant: "destructive" })
        }
    }

    // Radix can leave `pointer-events: none` on <body> when a dialog unmounts
    // mid-interaction, which freezes the whole page. Clear it once it has torn down.
    const closeForceDeleteDialog = () => {
        setIsForceDeleteOpen(false)
        setForceDeleteReason("")
        setTimeout(() => { document.body.style.pointerEvents = '' }, 100)
    }

    const handleForceDelete = async () => {
        if (!forceDeleteReason.trim()) {
            toast({
                title: "Reason is required.",
                description: "Explain why this profile has to be removed entirely.",
                variant: "destructive",
            })
            return
        }

        setIsForceDeleting(true)
        try {
            await studentService.forceDeleteStudent(studentId, forceDeleteReason)
            toast({ title: "Student purged", description: `${studentName}'s profile and records were deleted.` })
            onStudentUpdated()
            revalidateData('students')
            revalidateData('payments')
            revalidateData('unpaid')
            closeForceDeleteDialog()
        } catch (error) {
            console.error('Error force-deleting student:', error)
            toast({ title: "Error", description: "Failed to delete the student profile.", variant: "destructive" })
        } finally {
            setIsForceDeleting(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
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
                    {isOwner && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setIsForceDeleteOpen(true)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Force Delete (Owner)
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <UpdateStudentDialog
                student={student}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onStudentUpdated={onStudentUpdated}
            />
            {isOwner && (
                <AlertDialog
                    open={isForceDeleteOpen}
                    onOpenChange={(open) => { if (!open) closeForceDeleteDialog() }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Force Delete {studentName}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this student, their attendance, payments, and
                                enrollments. This action is logged.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor="forceDeleteReason">
                                Reason for deletion <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="forceDeleteReason"
                                rows={3}
                                value={forceDeleteReason}
                                onChange={(e) => setForceDeleteReason(e.target.value)}
                                placeholder="Why must this profile be removed entirely?"
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isForceDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => { e.preventDefault(); handleForceDelete() }}
                                disabled={isForceDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isForceDeleting ? "Deleting..." : "Delete Permanently"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    )
}
