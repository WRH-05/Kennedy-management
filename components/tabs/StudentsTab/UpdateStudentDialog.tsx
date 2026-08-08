"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Tables, TablesUpdate } from "@/types/database.types"
import { studentService } from "@/services/studentService"
import { gradeLevelsService } from "@/services/gradeLevelsService"

interface UpdateStudentDialogProps {
  student: Tables<"students"> & { grade_levels?: { id: number | string; name: string } | null }
  open: boolean
  onOpenChange: (open: boolean) => void
  onStudentUpdated: () => void
}

export function UpdateStudentDialog({
  student,
  open,
  onOpenChange,
  onStudentUpdated,
}: UpdateStudentDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gradeSearchQuery, setGradeSearchQuery] = useState("")
  const [showGradeLevelsResults, setShowGradeLevelsResults] = useState(false)
  const [filteredGradeLevels, setFilteredGradeLevels] = useState<Tables<"grade_levels">[]>([])

  const [formData, setFormData] = useState<TablesUpdate<"students">>({
    name: "",
    school_level: "",
    school: "",
    school_name: "",
    birth_date: "",
    phone: "",
    parent_phone: "",
    email: "",
    address: "",
  })

  // Sync form state when dialog opens with new student data
  useEffect(() => {
    if (open && student) {
      const gradeLevelName = (student as any).grade_levels?.name || ""
      setFormData({
        name: student.name || "",
        school_level: student.school_level || "",
        school: student.school || "",
        school_name: (student as any).school_name || "",
        birth_date: student.birth_date || "",
        phone: student.phone || "",
        parent_phone: (student as any).parent_phone || "",
        email: student.email || "",
        address: student.address || "",
      })
      setGradeSearchQuery(gradeLevelName)
      setFilteredGradeLevels([])
      setShowGradeLevelsResults(false)
    }
  }, [open, student])

  const inputSearch = (name: string) => {
    if (name.length === 0) return
    gradeLevelsService
      .getAllGradeLevelsByName(name)
      .then((v) => {
        setFilteredGradeLevels(v.data)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await studentService.updateStudent(student.id, formData)
      toast({
        title: "Student updated",
        description: `${formData.name} has been successfully updated.`,
      })
      onStudentUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating student:", error)
      toast({
        title: "Error",
        description: "Failed to update student: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* School Level (autocomplete) */}
            <div className="space-y-2">
              <Label htmlFor="edit-level">School Level</Label>
              <div className="relative">
                <Input
                  id="edit-level"
                  placeholder="Search for a level..."
                  autoComplete="off"
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
                          setFormData({ ...formData, school_level: level.id.toString() })
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
            </div>

            {/* School */}
            <div className="space-y-2">
              <Label htmlFor="edit-school">School</Label>
              <Input
                id="edit-school"
                value={formData.school || ""}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              />
            </div>

            {/* Current School Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-school-name">Current School Name</Label>
              <Input
                id="edit-school-name"
                value={formData.school_name || ""}
                onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                placeholder="Name of the student's current school"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-birth">Birth Date</Label>
              <Input
                id="edit-birth"
                type="date"
                value={formData.birth_date || ""}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>

            {/* Student Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Student Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Student phone number"
              />
            </div>

            {/* Parent Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit-parent-phone">Parent Phone Number</Label>
              <Input
                id="edit-parent-phone"
                value={formData.parent_phone || ""}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                placeholder="Parent phone number"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (Optional)</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
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
