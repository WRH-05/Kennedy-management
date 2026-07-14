"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, MapPin, Phone, Mail, School, X } from "lucide-react"
import { Tables, TablesUpdate } from "@/types/database.types"
import { Teacher } from "@/services/teacherService"
import { useState, useEffect } from "react"
import { coursesEligiblityService } from "@/services/courseEligibilityService"

interface TeacherInfoCardProps {
  teacher: Teacher
  isEditing: boolean
  editedTeacher: TablesUpdate<"teachers"> & { grade_level_ids?: string[] } // Note: If possible, renaming 'grade_level_ids' to 'course_eligibility_ids' in your DB schema would be ideal!
  onInputChange: (field: string, value: any) => void
}

export function TeacherInfoCard({ teacher, isEditing, editedTeacher, onInputChange }: TeacherInfoCardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<Tables<"course_eligibility_search_view">[]>([])

  
  const initialEligibilities = teacher.teachers_course_eligibility?.flatMap((tce) => {
    const courseName = tce.course_eligibility.courses.name
    const gradeLevelName = tce.course_eligibility.grade_levels?.name
    const combinedName = gradeLevelName ? `${courseName} (${gradeLevelName})` : courseName

    return [{ id: tce.course_eligibility.id, name: combinedName }]
  }) ?? []

  
  const [selectedEligibilities, setSelectedEligibilities] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (isEditing) {
      setSelectedEligibilities(initialEligibilities)

      if (!editedTeacher.grade_level_ids) {
        onInputChange("grade_level_ids", initialEligibilities.map(item => item.id.toString()))
      }
    }
  }, [isEditing])

  const handleSearch = (query: string) => {
    if (query.trim().length === 0) {
      setSearchResults([])
      return
    }

    coursesEligiblityService.searchAllCourseEligibilities(query)
      .then((response) => {
        const unselectedResults = response.data.filter(
          (item) => !selectedEligibilities.some((selected) => selected.id.toString() === item.eligibility_id?.toString())
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
    onInputChange("grade_level_ids", updated.map(item => item.id.toString()))

    setSearchQuery("")
    setSearchResults([])
  }

  const handleRemoveEligibility = (idToRemove: string | number) => {
    const updated = selectedEligibilities.filter(item => item.id.toString() !== idToRemove.toString())

    setSelectedEligibilities(updated)
    onInputChange("grade_level_ids", updated.map(item => item.id.toString()))
  }

  const eligibleCourseNames = teacher.teachers_course_eligibility?.flatMap(
    (tce) => tce.course_eligibility.courses.name ? [tce.course_eligibility.courses.name] : []
  ) ?? []

  const eligibleClassCombinations = initialEligibilities.flatMap(item => item.name ? [item.name] : [])

  const renderBadges = (items: string[], variant: "default" | "secondary") => {
    const validItems = items.filter((item) => item && item.trim())

    if (validItems.length === 0) {
      return <p className="text-gray-600">Not specified</p>
    }

    return validItems.map((item, idx) => (
      <Badge key={idx} variant={variant}>
        {item.trim()}
      </Badge>
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2" />
          Teacher Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          {isEditing ? (
            <Input
              id="name"
              value={editedTeacher.name || ''}
              onChange={(e) => onInputChange("name", e.target.value)}
            />
          ) : (
            <p className="text-lg font-semibold">{teacher.name}</p>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <Label>Address</Label>
            {isEditing ? (
              <Input
                value={editedTeacher.address || ''}
                onChange={(e) => onInputChange("address", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-gray-600">{teacher.address || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex items-center space-x-3">
          <Phone className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <Label>Phone Number</Label>
            {isEditing ? (
              <Input
                value={editedTeacher.phone || ''}
                onChange={(e) => onInputChange("phone", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-gray-600">{teacher.phone || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <Label>Email</Label>
            {isEditing ? (
              <Input
                type="email"
                value={editedTeacher.email || ''}
                onChange={(e) => onInputChange("email", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-gray-600">{teacher.email || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* School */}
        <div className="flex items-start space-x-3">
          <School className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <Label>School</Label>
            {isEditing ? (
              <Input
                value={editedTeacher.school || ''}
                onChange={(e) => onInputChange("school", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-gray-600">{teacher.school || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Subjects (Read-only for now) */}
        <div className="space-y-2">
          <Label>Subjects</Label>
          <div className="flex flex-wrap gap-2">
            {renderBadges(eligibleCourseNames, "default")}
          </div>
        </div>

        {/* Eligible Grade Levels (Editable) */}
        <div className="space-y-2">
          <Label>Eligible Classes & Grades</Label>
          {isEditing ? (
            <div className="space-y-3">
              {/* Selected Items */}
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

              {/* Autocomplete Search input */}
              <div className="relative">
                <Input
                  id="courseEligibilitySearch"
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
          ) : (
            <div className="flex flex-wrap gap-2">
              {renderBadges(eligibleClassCombinations, "secondary")}
            </div>
          )}
        </div>

        {/* Join Date */}
        <div className="space-y-2">
          <Label>Join Date</Label>
          <p className="text-gray-600">
            {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}