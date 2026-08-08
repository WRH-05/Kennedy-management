// UpdateGradeLevelsDialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Tables, TablesUpdate } from "@/types/database.types"
import { gradeLevelsService } from "@/services/gradeLevelsService"

interface UpdateGradeLevelDialogProps {
    GradeLevel: Tables<"grade_levels">
    onGradeLevelUpdated: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UpdateGradeLevelDialog({ GradeLevel: gradeLevel, onGradeLevelUpdated: onGradeLevelUpdated, open, onOpenChange }: UpdateGradeLevelDialogProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newGradeLevel, setNewGradeLevel] = useState<TablesUpdate<"grade_levels">>({ ...gradeLevel })

    // Keep internal form state in sync if parent's grade level changes
    useEffect(() => {
        setNewGradeLevel({ ...gradeLevel })
    }, [gradeLevel])

    const handleUpdateGradeLevel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            // Duplicate prevention: check for existing grade level with same name (case-insensitive), excluding self
            const existing = await gradeLevelsService.getAllGradeLevelsByName(newGradeLevel.name || "")
            const duplicate = (existing.data || []).find(
                (g) => g.id !== gradeLevel.id && g.name.toLowerCase() === (newGradeLevel.name || "").toLowerCase()
            )
            if (duplicate) {
                toast({
                    title: "Duplicate",
                    description: "A grade level with this name already exists.",
                    variant: "destructive",
                })
                setIsSubmitting(false)
                return
            }

            await gradeLevelsService.updateGradeLevel(gradeLevel.id, newGradeLevel)
            onGradeLevelUpdated()
            onOpenChange(false)

            toast({
                title: "Grade Level updated",
                description: `${newGradeLevel.name} has been successfully updated.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update grade level: " + (error as Error).message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Trigger is removed here because it's handled by the parent row */}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update Grade Level</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateGradeLevel} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newGradeLevel.name || ""}
                                onChange={(e) => setNewGradeLevel({ ...newGradeLevel, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Grade Level"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}