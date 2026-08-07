"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface TeacherHeaderProps {
  canEdit: boolean
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function TeacherHeader({ canEdit, isEditing, onEdit, onSave, onCancel }: TeacherHeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Teacher Profile</h1>
          </div>
          {canEdit && (
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={onSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}