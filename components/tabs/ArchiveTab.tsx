"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, Check, X, Undo, MoreHorizontal } from "lucide-react"
import { studentService } from "@/services/studentService"
import { teacherService } from "@/services/teacherService"
import { courseInstancesService } from "@/services/courseInstancesService"
import { archiveService } from "@/services/archiveService"

interface ArchiveTabProps {
  isManager?: boolean
  onArchiveUpdate?: () => void
}

interface ArchiveRequest {
  id: string
  entity_type: string
  entity_id: string
  entity_name: string
  requested_by: string
  created_at: string
  status: string
  approved_by?: string | null
  approved_date?: string | null
  reason?: string | null
  updated_at?: string | null
}

export default function ArchiveTab({ isManager = false }: ArchiveTabProps) {
  const [archiveRequests, setArchiveRequests] = useState<ArchiveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadArchiveRequests()
  }, [])

  const loadArchiveRequests = async () => {
    setLoading(true)
    try {
      const requests = await archiveService.getAllArchiveRequests()
      setArchiveRequests((requests || []) as ArchiveRequest[])
    } catch (error) {
      console.error('Error loading archive requests:', error)
      setArchiveRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApproveArchive = async (requestId: string) => {
    // Optimistic update - immediately update UI
    setArchiveRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'approved' as const, approved_date: new Date().toISOString() }
        : req
    ))
    setProcessingIds(prev => new Set(prev).add(requestId))

    try {
      await archiveService.approveArchiveRequest(requestId)
      
    } catch (error) {
      console.error('Error approving archive request:', error)
      // Rollback on error
      await loadArchiveRequests()
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  const handleDenyArchive = async (requestId: string) => {
    // Optimistic update - immediately update UI
    setArchiveRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'denied' as const, approved_date: new Date().toISOString() }
        : req
    ))
    setProcessingIds(prev => new Set(prev).add(requestId))

    try {
      await archiveService.denyArchiveRequest(requestId)
      // Notify parent to update pending archive IDs without full refetch
    } catch (error) {
      console.error('Error denying archive request:', (error as Error)?.message ?? error)
      // Rollback on error
      await loadArchiveRequests()
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
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
        await courseInstancesService.unarchiveCourse(entityId)
      }

      // Reload archive requests
      await loadArchiveRequests()

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
        <div className="max-h-113.75 overflow-auto scrollbar-thin">
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
                    <TableCell>{request.requested_by || 'Unknown'}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{request.reason || 'No reason provided'}</TableCell>
                    {isManager && (
                      <TableCell className="w-10">
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
                    <TableCell>{request.requested_by || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.approved_by || '-'}</TableCell>
                    <TableCell>
                      {request.approved_date 
                        ? new Date(request.approved_date).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    {isManager && (
                      <TableCell className="w-10">
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
