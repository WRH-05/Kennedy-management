"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, MapPin, Phone, Mail, School } from "lucide-react"
import { Tables, TablesUpdate } from "@/types/database.types"

interface TeacherInfoCardProps {
  teacher: Tables<"teachers">
  isEditing: boolean
  editedTeacher: TablesUpdate<"teachers">
  onInputChange: (field: string, value: any) => void
}

export function TeacherInfoCard({ teacher, isEditing, editedTeacher, onInputChange }: TeacherInfoCardProps) {
  const renderBadges = (data: any, variant: "default" | "secondary") => {
    if (!data) return <p className="text-gray-600">Not specified</p>
    const items = Array.isArray(data) ? data : (typeof data === 'string' ? data.split(',') : [])
    
    return items.filter((s: string) => s && s.trim()).map((item: string, idx: number) => (
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
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          {isEditing ? (
            <Input
              id="name"
              value={editedTeacher.name}
              onChange={(e) => onInputChange("name", e.target.value)}
            />
          ) : (
            <p className="text-lg font-semibold">{teacher.name}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label>Subjects</Label>
          {isEditing ? (
            <Input
              value={editedTeacher.subjects || ''}
              onChange={(e) => onInputChange("subjects", e.target.value)}
              placeholder="Separate subjects with commas"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {renderBadges(teacher.subjects, "default")}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>School Years</Label>
          {isEditing ? (
            <Input
              value={editedTeacher.school_years || ''}
              onChange={(e) => onInputChange("school_years", e.target.value)}
              placeholder="Separate school years with commas"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {renderBadges(teacher.school_years, "secondary")}
            </div>
          )}
        </div>

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