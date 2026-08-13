"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GraduationCap, Plus, X } from "lucide-react"
import { Tables } from "@/types/database.types"
import { teacherService } from "@/services/teacherService"
import { coursesEligiblityService } from "@/services/courseEligibilityService"
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

    // Course eligibility multi-select (optional)
    const [searchQuery, setSearchQuery] = useState("")
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [searchResults, setSearchResults] = useState<Tables<"course_eligibility_search_view">[]>([])
    const [selectedEligibilities, setSelectedEligibilities] = useState<Array<{ id: string; name: string }>>([])

    const handleSearch = (query: string) => {
        if (query.trim().length === 0) {
            setSearchResults([])
            return
        }
        coursesEligiblityService
            .searchAllCourseEligibilities(query)
            .then((response) => {
                const unselected = response.data.filter(
                    (item) => !selectedEligibilities.some((s) => s.id === item.eligibility_id?.toString())
                )
                setSearchResults(unselected)
            })
            .catch((error) => {
                console.error("Failed to search course eligibilities:", error)
            })
    }

    const handleAddEligibility = (item: Tables<"course_eligibility_search_view">) => {
        if (!item.eligibility_id) return
        const combinedName = `${item.course_name} (${item.grade_level_name})`
        const updated = [...selectedEligibilities, { id: item.eligibility_id, name: combinedName }]
        setSelectedEligibilities(updated)
        setSearchQuery("")
        setSearchResults([])
    }

    const handleRemoveEligibility = (idToRemove: string) => {
        setSelectedEligibilities(selectedEligibilities.filter((item) => item.id !== idToRemove))
    }

    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            const teacherPayload = {
                name: newTeacher.name,
                address: newTeacher.address,
                phone: newTeacher.phone,
                email: newTeacher.email,
                school: newTeacher.school,
            }

            const createdTeacher = await teacherService.addTeacher(teacherPayload)

            // Persist selected eligibilities via the junction table
            for (const eligibility of selectedEligibilities) {
                await teacherService.addCourseEligibility(createdTeacher.id, eligibility.id)
            }

            const updatedTeachers = (await teacherService.getAllTeachers()).data
            onTeacherAdded(updatedTeachers)

            setNewTeacher({ name: "", address: "", phone: "", email: "", school: "" })
            setSelectedEligibilities([])
            setSearchQuery("")
            setOpen(false)
            toast({ title: "Teacher added", description: `${teacherPayload.name} has been successfully added.` })
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

                    {/* Eligible Classes & Grades (Optional) */}
                    <div className="space-y-3 pt-2 border-t">
                        <Label className="text-sm font-semibold">Eligible Classes & Grades (Optional)</Label>

                        <div className="flex flex-wrap gap-2 min-h-8 p-2 border rounded-md bg-gray-50/50">
                            {selectedEligibilities.length === 0 ? (
                                <span className="text-xs text-gray-400 self-center">No classes assigned yet.</span>
                            ) : (
                                selectedEligibilities.map((eligibility) => (
                                    <Badge key={eligibility.id} variant="secondary" className="flex items-center gap-1 pr-1.5">
                                        {eligibility.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEligibility(eligibility.id)}
                                            className="rounded-full outline-none hover:bg-gray-200 p-0.5 text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                id="teacherEligibilitySearch"
                                placeholder="Type to search and add a class/grade..."
                                value={searchQuery}
                                autoComplete="off"
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setShowSearchResults(e.target.value.length > 0)
                                    handleSearch(e.target.value)
                                }}
                                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                            />
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                                    {searchResults.map((item) => (
                                        <div
                                            key={item.eligibility_id}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                            onMouseDown={() => handleAddEligibility(item)}
                                        >
                                            <div className="font-medium text-sm text-gray-900">
                                                {item.course_name} ({item.grade_level_name})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
