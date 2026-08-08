"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tables } from "@/types/database.types"
import { Teacher, teacherService } from "@/services/teacherService"
import { coursesEligiblityService } from "@/services/courseEligibilityService"

interface UpdateTeacherDialogProps {
  teacher: Teacher
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeacherUpdated: () => void
}

export function UpdateTeacherDialog({
  teacher,
  open,
  onOpenChange,
  onTeacherUpdated,
}: UpdateTeacherDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Profile fields
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [school, setSchool] = useState("")

  // Course eligibility multi-select
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<Tables<"course_eligibility_search_view">[]>([])
  const [selectedEligibilities, setSelectedEligibilities] = useState<Array<{ id: string; name: string }>>([])
  const [courseEligibilityIds, setCourseEligibilityIds] = useState<string[]>([])

  // Sync form state when dialog opens with new teacher data
  useEffect(() => {
    if (open && teacher) {
      setName(teacher.name || "")
      setAddress(teacher.address || "")
      setPhone(teacher.phone || "")
      setEmail(teacher.email || "")
      setSchool(teacher.school || "")

      // Flatten course eligibility
      const eligibilities =
        teacher.teachers_course_eligibility?.map((tce) => {
          const courseName = tce.course_eligibility.courses?.name || ""
          const gradeLevelName = tce.course_eligibility.grade_levels?.name
          const combinedName = gradeLevelName ? `${courseName} (${gradeLevelName})` : courseName
          return { id: tce.course_eligibility.id, name: combinedName }
        }) ?? []

      setSelectedEligibilities(eligibilities)
      setCourseEligibilityIds(eligibilities.map((e) => e.id))
      setSearchQuery("")
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [open, teacher])

  const handleSearch = (query: string) => {
    if (query.trim().length === 0) {
      setSearchResults([])
      return
    }

    coursesEligiblityService
      .searchAllCourseEligibilities(query)
      .then((response) => {
        const unselectedResults = response.data.filter(
          (item) => !selectedEligibilities.some((selected) => selected.id === item.eligibility_id?.toString())
        )
        setSearchResults(unselectedResults)
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
    setCourseEligibilityIds(updated.map((e) => e.id))
    setSearchQuery("")
    setSearchResults([])
  }

  const handleRemoveEligibility = (idToRemove: string) => {
    const updated = selectedEligibilities.filter((item) => item.id !== idToRemove)
    setSelectedEligibilities(updated)
    setCourseEligibilityIds(updated.map((e) => e.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = {
        name,
        address,
        phone,
        email,
        school,
        grade_level_ids: courseEligibilityIds,
      }
      await teacherService.updateTeacher(teacher.id, payload)
      toast({
        title: "Teacher updated",
        description: `${name} has been successfully updated.`,
      })
      onTeacherUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating teacher:", error)
      toast({
        title: "Error",
        description: "Failed to update teacher: " + (error as Error).message,
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
          <DialogTitle>Edit Teacher</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-teacher-name">Full Name</Label>
              <Input
                id="edit-teacher-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* School */}
            <div className="space-y-2">
              <Label htmlFor="edit-teacher-school">School</Label>
              <Input
                id="edit-teacher-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit-teacher-phone">Phone Number</Label>
              <Input
                id="edit-teacher-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-teacher-email">Email (Optional)</Label>
              <Input
                id="edit-teacher-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-teacher-address">Address</Label>
              <Input
                id="edit-teacher-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Eligible Classes & Grades */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-semibold">Eligible Classes & Grades</Label>

            {/* Selected badges */}
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

            {/* Autocomplete search */}
            <div className="relative">
              <Input
                id="edit-teacher-eligibility-search"
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
