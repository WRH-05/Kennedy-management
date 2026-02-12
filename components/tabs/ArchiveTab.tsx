"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, Check, X, Undo, MoreHorizontal } from "lucide-react"
import { studentService, teacherService, courseService, archiveService } from "@/services/appDataService"

interface ArchiveTabProps {
  isManager?: boolean
  onArchiveUpdate?: () => void
}

interface ArchiveRequest {
  id: string
  entity_type: 'student' | 'teacher' | 'course'
  entity_id: string
  entity_name: string
  requested_by: string
  requested_by_name: string
  created_at: string
  status: 'pending' | 'approved' | 'denied'
  approved_by?: string
  approved_by_name?: string
  approved_date?: string
  reason?: string
}

export default function ArchiveTab({ isManager = false, onArchiveUpdate }: ArchiveTabProps) {
  const [archiveRequests, setArchiveRequests] = useState<ArchiveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArchiveRequests()
  }, [])

  const loadArchiveRequests = async () => {
    setLoading(true)
    try {
      const requests = await archiveService.getAllArchiveRequests()
      setArchiveRequests(requests || [])
    } catch (error) {
      console.error('Error loading archive requests:', error)
      setArchiveRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApproveArchive = async (requestId: string) => {
    try {
      await archiveService.approveArchiveRequest(requestId)
      
      // Reload archive requests
      await loadArchiveRequests()
      
      if (onArchiveUpdate) {
        onArchiveUpdate()
      }
    } catch (error) {
      console.error('Error approving archive request:', error)
    }
  }

  const handleDenyArchive = async (requestId: string) => {
    try {
      await archiveService.denyArchiveRequest(requestId)
      
      // Reload archive requests
      await loadArchiveRequests()
      
      if (onArchiveUpdate) {
        onArchiveUpdate()
      }
    } catch (error) {
      console.error('Error denying archive request:', error)
    }
  }

  const handleUnarchive = async (type: string, entityId: string) => {
    try {
      // Unarchive the entity based on type
      if (type === 'student') {
        await studentService.unarchiveStudent(entityId)
      } else if (type === 'teacher') {
        await teacherService.unarchiveTeacher(entityId)
      } else if (type === 'course') {
        await courseService.unarchiveCourse(entityId)
      }

      // Reload archive requests
      await loadArchiveRequests()

      if (onArchiveUpdate) {
        onArchiveUpdate()
      }
    } catch (error) {
      console.error('Error unarchiving entity:', error)
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
        <div className="max-h-[455px] overflow-auto scrollbar-thin">
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
                  <TableRow key={request.id} className="group">
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{request.entity_name}</TableCell>
                    <TableCell>{request.requested_by_name || 'Unknown'}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{request.reason || 'No reason provided'}</TableCell>
                    {isManager && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleApproveArchive(request.id)}
                              className="text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDenyArchive(request.id)}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Deny
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
          <div className="mt-6">
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
                  <TableRow key={request.id} className="opacity-60 group">
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{request.entity_name}</TableCell>
                    <TableCell>{request.requested_by_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.approved_by_name || '-'}</TableCell>
                    <TableCell>
                      {request.approved_date 
                        ? new Date(request.approved_date).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    {isManager && (
                      <TableCell>
                        {request.status === 'approved' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleUnarchive(request.entity_type, request.entity_id)}
                              >
                                <Undo className="mr-2 h-4 w-4" />
                                Unarchive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  )
}
