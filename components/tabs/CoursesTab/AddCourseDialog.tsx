"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Enums, TablesInsert } from "@/types/database.types"
import { coursesService } from "@/services/coursesService"


interface AddCourseDialogProps {
    onCourseAdded: () => void
}
export function AddCourseDialog({ onCourseAdded }: AddCourseDialogProps) {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newCourse, setNewCourse] = useState<TablesInsert<"courses">>({
        name: "",
        type: "academic"
    })


    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {

            await coursesService.addCourse(newCourse)
            onCourseAdded()

            // Reset
            setNewCourse({
                name: "",
                type: "academic"
            });
            setIsOpen(false)

            toast({
                title: "Course added",
                description: `${newCourse.name} has been successfully added.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add course: " + (error as Error).message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Course
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={newCourse.name}
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
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Course"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}