"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { studentService } from "@/services/studentService"
import { useToast } from "@/hooks/use-toast"
import { gradeLevelsService } from "@/services/gradeLevelsService"

interface AddStudentDialogProps {
    onStudentAdded: (updatedStudents: TablesUpdate<"students">[]) => void
}

export function AddStudentDialog({ onStudentAdded }: AddStudentDialogProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [gradeSearchQuery, setGradeSearchQuery] = useState("")
    const [showGradeLevelsResults, setShowGradeLevelsResults] = useState(false)
    const [filteredGradeLevels, setFilteredGradeLevels] = useState<Tables<"grade_levels">[]>([])

    const inputSearch = (name: string) => {
        if (name.length == 0) return
        gradeLevelsService.getAllGradeLevelsByName(name).then((v) => {
            setFilteredGradeLevels(v.data);
        })
            .catch((e) => {
                console.error(e);
            })
    }

    const [newStudent, setNewStudent] = useState<TablesInsert<"students">>({
        name: "",
        birth_date: "",
        phone: "",
        email: "",
        address: "",
        school: "",
        school_level: "",
        registration_fee_paid: false,
        archived: false,
        archived_date: null
    })

    const handleSchoolLevelChange = (level: string) => {
        setNewStudent({ ...newStudent, school_level: level })
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            await studentService.addStudent(newStudent)
            const updatedStudents = await studentService.getAllStudents()
            onStudentAdded(updatedStudents.data)

            setNewStudent({
                name: "", birth_date: "", phone: "", email: "", address: "", school: "",
                school_level: "", registration_fee_paid: false,
                archived: false, archived_date: null
            })
            setOpen(false)
            toast({ title: "Student added", description: `${newStudent.name} has been successfully added.` })
        } catch (error) {
            console.error("Error adding student:", error)
            toast({
                title: "Error",
                description: "Failed to add student: " + (error as Error).message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={newStudent.name}
                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="studentSearch"
                                placeholder="Search for a level..."
                                value={gradeSearchQuery}
                                onChange={(e) => {
                                    setGradeSearchQuery(e.target.value)
                                    setShowGradeLevelsResults(e.target.value.length > 0)
                                    inputSearch(e.target.value)
                                }}
                                onBlur={() => setTimeout(() => setShowGradeLevelsResults(false), 150)}
                                onFocus={() => setShowGradeLevelsResults(gradeSearchQuery.length > 0)}
                                required
                            />
                            {showGradeLevelsResults && filteredGradeLevels.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                                    {filteredGradeLevels.map((level) => (
                                        <div
                                            key={level.id}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                            onMouseDown={() => {
                                                handleSchoolLevelChange(level.id.toString())
                                                setGradeSearchQuery(level.name)
                                                setShowGradeLevelsResults(false)
                                            }}
                                        >
                                            <div className="font-medium text-sm text-gray-900">{level.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={newStudent.address || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birthDate">Birth Date</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={newStudent.birth_date || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, birth_date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={newStudent.phone || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newStudent.email || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="registrationFee"
                            checked={newStudent.registration_fee_paid}
                            onCheckedChange={(checked) => setNewStudent({ ...newStudent, registration_fee_paid: checked as boolean })}
                        />
                        <Label htmlFor="registrationFee">Registration Fee Paid</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Student"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}