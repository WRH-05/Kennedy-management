// UpdateCourseDialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Enums, Tables, TablesUpdate } from "@/types/database.types"
import { coursesService } from "@/services/coursesService"

interface UpdateCourseDialogProps {
    course: Tables<"courses">
    onCourseUpdated: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UpdateCourseDialog({ course, onCourseUpdated, open, onOpenChange }: UpdateCourseDialogProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newCourse, setNewCourse] = useState<TablesUpdate<"courses">>({ ...course })

    // Keep internal form state in sync if parent's course changes
    useEffect(() => {
        setNewCourse({ ...course })
    }, [course])

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            // Duplicate prevention: check for existing course with same name (case-insensitive), excluding self
            const existing = await coursesService.getAllCoursesByName(newCourse.name || "")
            const duplicate = (existing.data || []).find(
                (c) => c.id !== course.id && c.name.toLowerCase() === (newCourse.name || "").toLowerCase()
            )
            if (duplicate) {
                toast({
                    title: "Duplicate",
                    description: "A course with this name already exists.",
                    variant: "destructive",
                })
                setIsSubmitting(false)
                return
            }

            await coursesService.updateCourse(course.id, newCourse)
            onCourseUpdated()
            onOpenChange(false)

            toast({
                title: "Course updated", // Fixed typo "added" -> "updated"
                description: `${newCourse.name} has been successfully updated.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update course: " + (error as Error).message,
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
                    <DialogTitle>Edit Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newCourse.name || ""}
                                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="courseType">Course Type</Label>
                            <Select
                                value={newCourse.type}
                                onValueChange={(val) => {
                                    setNewCourse({ ...newCourse, type: val as Enums<"course_type"> })
                                }}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="extracurricular">Extracurricular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}