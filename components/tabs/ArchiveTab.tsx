"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Archive, Check, X, Undo } from "lucide-react"
import { studentService, teacherService, courseService } from "@/src/services/appDataService"

interface ArchiveTabProps {
  isManager?: boolean
  onArchiveUpdate?: () => void
}

interface ArchiveRequest {
  id: number
  type: 'student' | 'teacher' | 'course'
  entityId: number
  entityName: string
  requestedBy: string
  requestedDate: string
  status: 'pending' | 'approved' | 'denied'
  approvedBy?: string
  approvedDate?: string
  reason?: string
  details?: any
}

export default function ArchiveTab({ isManager = false, onArchiveUpdate }: ArchiveTabProps) {
  const router = useRouter()
  const [archiveRequests, setArchiveRequests] = useState<ArchiveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArchiveRequests()
  }, [])

  const loadArchiveRequests = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would fetch from the archive_requests table
      // For now, show empty state since we've cleaned up localStorage usage
      setArchiveRequests([])
    } catch (error) {
      // Error loading archive requests
    } finally {
      setLoading(false)
    }
  }

  const handleApproveArchive = async (requestId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || '{}')
      
      // Find the request to approve
      const request = archiveRequests.find(req => req.id === requestId)
      if (!request) return

      // Perform the actual archiving based on type
      if (request.type === 'student') {
        await studentService.archiveStudent(request.entityId)
      } else if (request.type === 'teacher') {
        await teacherService.archiveTeacher(request.entityId)
      } else if (request.type === 'course') {
        await courseService.archiveCourse(request.entityId)
      }

      // Remove the request from local state
      setArchiveRequests(prev => prev.filter(req => req.id !== requestId))
      
      if (onArchiveUpdate) {
        onArchiveUpdate()
      }
    } catch (error) {
      // Error approving archive request
    }
  }

  const handleDenyArchive = async (requestId: number) => {
    try {
      // Remove the request from local state without archiving
      setArchiveRequests(prev => prev.filter(req => req.id !== requestId))
      
      if (onArchiveUpdate) {
        onArchiveUpdate()
      }
    } catch (error) {
      // Error denying archive request
    }
  }

  const handleUnarchive = async (type: string, entityId: number) => {
    try {
      // Unarchive the entity based on type
      if (type === 'student') {
        await studentService.unarchiveStudent(entityId)
      } else if (type === 'teacher') {
        await teacherService.unarchiveTeacher(entityId)
      } else if (type === 'course') {
        await courseService.unarchiveCourse(entityId)
      }

      if (onArchiveUpdate) {
        onArchiveUpdate()
      }
    } catch (error) {
      // Error unarchiving entity
    }
  }

  const pendingRequests = archiveRequests.filter(req => req.status === 'pending')
  const processedRequests = archiveRequests.filter(req => req.status !== 'pending')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="h-5 w-5 mr-2" />
            Archive Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Loading archive requests...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Archive className="h-5 w-5 mr-2" />
          Archive Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Requests */}
        <div>
          <h3 className="text-lg font-medium mb-4">Pending Archive Requests</h3>
          {pendingRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity Name</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Reason</TableHead>
                  {isManager && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{request.entityName}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>{new Date(request.requestedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{request.reason || 'No reason provided'}</TableCell>
                    {isManager && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveArchive(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDenyArchive(request.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending archive requests</p>
            </div>
          )}
        </div>

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Archive History</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity Name</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead>Date Processed</TableHead>
                  {isManager && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id} className="opacity-60">
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{request.entityName}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.approvedBy || '-'}</TableCell>
                    <TableCell>{request.approvedDate || '-'}</TableCell>
                    {isManager && (
                      <TableCell>
                        {request.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnarchive(request.type, request.entityId)}
                          >
                            <Undo className="h-4 w-4 mr-1" />
                            Unarchive
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
