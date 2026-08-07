"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TablesInsert } from "@/types/database.types"
import { gradeLevelsService } from "@/services/gradeLevelsService"



interface AddGradeLevelDialogProps {
    ongradeLevelAdded: () => void
}
export function AddGradeLevelDialog({ ongradeLevelAdded: onGradeLevelAdded }: AddGradeLevelDialogProps) {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newGradeLevel, setNewGradeLevel] = useState<TablesInsert<"grade_levels">>({
        name: "",
    })


    const handleAddGradeLevel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {

            await gradeLevelsService.addGradeLevel(newGradeLevel)
            onGradeLevelAdded()

            // Reset
            setNewGradeLevel({
                name: "",
            });
            setIsOpen(false)

            toast({
                title: "Grade Level added",
                description: `${newGradeLevel.name} has been successfully added.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add Grade Level: " + (error as Error).message,
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
                    <Plus className="h-4 w-4 mr-2" /> Add Grade Level
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Grade Level</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddGradeLevel} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newGradeLevel.name}
                                onChange={(e) => setNewGradeLevel({ ...newGradeLevel, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Grade Level"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}