"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GraduationCap, Plus } from "lucide-react"
import { teacherService } from "@/services/teacherService"
import { useToast } from "@/hooks/use-toast"

interface AddTeacherDialogProps {
    onTeacherAdded: (updatedTeachers: any[]) => void
}

export function AddTeacherDialog({ onTeacherAdded }: AddTeacherDialogProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [newTeacher, setNewTeacher] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        school: "",
    })

    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            const teacher = {
                name: newTeacher.name,
                address: newTeacher.address,
                phone: newTeacher.phone,
                email: newTeacher.email,
                school: newTeacher.school,
            }

            await teacherService.addTeacher(teacher)
            const updatedTeachers = (await teacherService.getAllTeachers()).data
            onTeacherAdded(updatedTeachers)

            setNewTeacher({ name: "", address: "", phone: "", email: "", school: "" })
            setOpen(false)
            toast({ title: "Teacher added", description: `${teacher.name} has been successfully added.` })
        } catch (error) {
            toast({ title: "Error", description: "Failed to add teacher: " + (error as Error).message, variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Teacher
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTeacher} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="profName">Full Name</Label>
                            <Input id="profName" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profAddress">Address</Label>
                            <Input id="profAddress" value={newTeacher.address} onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profPhone">Phone Number</Label>
                            <Input id="profPhone" value={newTeacher.phone} onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profEmail">Email (Optional)</Label>
                            <Input id="profEmail" type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profSchool">School They Work At</Label>
                            <Input id="profSchool" value={newTeacher.school} onChange={(e) => setNewTeacher({ ...newTeacher, school: e.target.value })} required />
                        </div>

                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            <GraduationCap className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Adding..." : "Add Teacher"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}