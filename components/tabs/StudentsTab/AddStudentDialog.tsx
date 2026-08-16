"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, X } from "lucide-react"
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { studentService } from "@/services/studentService"
import { studentPaymentService } from "@/services/studentPaymentService"
import { useToast } from "@/hooks/use-toast"
import { revalidateData } from "@/hooks/swr-config"
import { gradeLevelsService } from "@/services/gradeLevelsService"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"

interface AddStudentDialogProps {
    onStudentAdded: (updatedStudents: TablesUpdate<"students">[]) => void
}

export function AddStudentDialog({ onStudentAdded }: AddStudentDialogProps) {
    const { toast } = useToast()
    const { settings } = useSchoolSettings()
    const registrationFee = settings?.default_registration_fee || 500
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [gradeSearchQuery, setGradeSearchQuery] = useState("")
    const [showGradeLevelsResults, setShowGradeLevelsResults] = useState(false)
    const [filteredGradeLevels, setFilteredGradeLevels] = useState<Tables<"grade_levels">[]>([])
    const [academicLevel, setAcademicLevel] = useState<{ id: string; name: string } | null>(null)
    const [extracurricularLevels, setExtracurricularLevels] = useState<{ id: string; name: string }[]>([])

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
        parent_phone: "",
        email: "",
        address: "",
        school: "",
        school_name: "",
        school_level: "",
        registration_fee_paid: false,
        archived: false,
        archived_date: null
    })

    const handleAddLevel = (level: Tables<"grade_levels">) => {
        if (level.type === 'academic') {
            setAcademicLevel({ id: level.id, name: level.name })
        } else {
            setExtracurricularLevels((prev) =>
                prev.some((l) => l.id === level.id) ? prev : [...prev, { id: level.id, name: level.name }]
            )
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            // Require at least one phone number (student or parent)
            if (!newStudent.phone?.trim() && !newStudent.parent_phone?.trim()) {
                toast({
                    title: "Phone Required",
                    description: "Please enter at least one phone number (student or parent).",
                    variant: "destructive",
                })
                setIsSubmitting(false)
                return
            }

            // Require at least one grade level (academic or extracurricular)
            if (!academicLevel && extracurricularLevels.length === 0) {
                toast({
                    title: "Grade Level Required",
                    description: "Please select at least one grade level.",
                    variant: "destructive",
                })
                setIsSubmitting(false)
                return
            }

            const payload: TablesInsert<"students"> = {
                ...newStudent,
                school_level: academicLevel ? academicLevel.id : (null as any),
                extracurricular_grade_level_ids: extracurricularLevels.map((l) => l.id),
            }

            const createdStudent = await studentService.addStudent(payload)

            // If registration fee paid on creation, log it to revenue
            if (newStudent.registration_fee_paid) {
              try {
                await studentPaymentService.payRegistrationFee(createdStudent.id)
                revalidateData('payments')
              } catch (feeError) {
                console.error("Failed to record registration fee payment:", feeError)
              }
            }

            const updatedStudents = await studentService.getAllStudents()
            onStudentAdded(updatedStudents.data)

            setNewStudent({
                name: "", birth_date: "", phone: "", parent_phone: "", email: "", address: "", school: "", school_name: "",
                school_level: "", registration_fee_paid: false,
                archived: false, archived_date: null
            })
            setAcademicLevel(null)
            setExtracurricularLevels([])
            setGradeSearchQuery("")
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
                        {/* Left: Full Name | Right: Grade Levels */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={newStudent.name}
                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="studentSearch">Grade Levels</Label>
                            <div className="flex flex-wrap gap-2 min-h-8 p-2 border rounded-md bg-gray-50/50">
                                {!academicLevel && extracurricularLevels.length === 0 && (
                                    <span className="text-xs text-gray-400 self-center">No grade levels selected.</span>
                                )}
                                {academicLevel && (
                                    <Badge variant="secondary" className="flex items-center gap-1 pr-1.5">
                                        {academicLevel.name}
                                        <button
                                            type="button"
                                            onClick={() => setAcademicLevel(null)}
                                            className="rounded-full outline-none hover:bg-gray-200 p-0.5 text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {extracurricularLevels.map((level) => (
                                    <Badge key={level.id} variant="outline" className="flex items-center gap-1 pr-1.5">
                                        {level.name}
                                        <button
                                            type="button"
                                            onClick={() => setExtracurricularLevels((prev) => prev.filter((l) => l.id !== level.id))}
                                            className="rounded-full outline-none hover:bg-gray-200 p-0.5 text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="relative">
                                <Input
                                    id="studentSearch"
                                    placeholder="Search to add a level..."
                                    value={gradeSearchQuery}
                                    onChange={(e) => {
                                        setGradeSearchQuery(e.target.value)
                                        setShowGradeLevelsResults(e.target.value.length > 0)
                                        inputSearch(e.target.value)
                                    }}
                                    onBlur={() => setTimeout(() => setShowGradeLevelsResults(false), 150)}
                                    onFocus={() => setShowGradeLevelsResults(gradeSearchQuery.length > 0)}
                                />
                                {showGradeLevelsResults && filteredGradeLevels.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                                        {filteredGradeLevels.map((level) => (
                                            <div
                                                key={level.id}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                                onMouseDown={() => {
                                                    handleAddLevel(level)
                                                    setGradeSearchQuery("")
                                                    setShowGradeLevelsResults(false)
                                                }}
                                            >
                                                <div className="font-medium text-sm text-gray-900">
                                                    {level.name}
                                                    <span className="text-gray-400 text-xs ml-1">
                                                        {level.type === 'academic' ? 'Academic' : 'Extracurricular'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Left: Student Phone | Right: Birth Date */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Student Phone</Label>
                            <Input
                                id="phone"
                                value={newStudent.phone || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                placeholder="Student phone number"
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

                        {/* Left: Current School Name | Right: Parent Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="schoolName">Current School Name</Label>
                            <Input
                                id="schoolName"
                                value={newStudent.school_name || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, school_name: e.target.value })}
                                placeholder="Name of the student's current school"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parentPhone">Parent Phone Number</Label>
                            <Input
                                id="parentPhone"
                                value={newStudent.parent_phone || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })}
                                placeholder="Parent phone number"
                            />
                        </div>

                        {/* Left: Email | Right: Address */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newStudent.email || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            />
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
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="registrationFee"
                            checked={newStudent.registration_fee_paid}
                            onCheckedChange={(checked) => setNewStudent({ ...newStudent, registration_fee_paid: checked as boolean })}
                        />
                        <Label htmlFor="registrationFee">Registration Fee Paid ({registrationFee} DA)</Label>
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
