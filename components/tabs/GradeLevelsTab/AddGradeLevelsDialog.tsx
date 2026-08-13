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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



interface AddGradeLevelDialogProps {
    ongradeLevelAdded: () => void
}
export function AddGradeLevelDialog({ ongradeLevelAdded: onGradeLevelAdded }: AddGradeLevelDialogProps) {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newGradeLevel, setNewGradeLevel] = useState<TablesInsert<"grade_levels">>({
        name: "",
        type: "academic",
    })


    const handleAddGradeLevel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            // Duplicate prevention: check for existing grade level with same name (case-insensitive)
            const existing = await gradeLevelsService.getAllGradeLevelsByName(newGradeLevel.name)
            const duplicate = (existing.data || []).find(
                (g) => g.name.toLowerCase() === newGradeLevel.name.toLowerCase()
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

            await gradeLevelsService.addGradeLevel(newGradeLevel)
            onGradeLevelAdded()

            // Reset
            setNewGradeLevel({
                name: "",
                type: "academic",
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
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={newGradeLevel.type || "academic"}
                                onValueChange={(val) => setNewGradeLevel({ ...newGradeLevel, type: val })}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select type" />
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
                            {isSubmitting ? "Adding..." : "Add Grade Level"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}