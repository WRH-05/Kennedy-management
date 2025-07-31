"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Archive, Check, X, Undo } from "lucide-react"
import { studentService, teacherService, courseService } from "@/src/services/dataService"

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
      // Load archive requests from localStorage for now
      let requests = JSON.parse(localStorage.getItem('archiveRequests') || '[]')
      
      // If no requests exist, create some example data
      if (requests.length === 0) {
        const exampleRequests = [
          {
            id: 1,
            type: 'student',
            entityId: 1,
            entityName: 'Ahmed Benali',
            requestedBy: 'receptionist1',
            requestedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            status: 'pending',
            reason: 'Student transferred to another school'
          },
          {
            id: 2,
            type: 'teacher',
            entityId: 2,
            entityName: 'Dr. Fatima Zohra',
            requestedBy: 'receptionist1',
            requestedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            status: 'approved',
            approvedBy: 'manager1',
            approvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 3 days ago
            reason: 'Teacher resigned'
          },
          {
            id: 3,
            type: 'course',
            entityId: 1,
            entityName: 'Mathematics - 3AS',
            requestedBy: 'receptionist1',
            requestedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            status: 'pending',
            reason: 'Course discontinued due to low enrollment'
          }
        ]
        localStorage.setItem('archiveRequests', JSON.stringify(exampleRequests))
        requests = exampleRequests
      }
      
      setArchiveRequests(requests)
    } catch (error) {
      console.error('Error loading archive requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveArchive = async (requestId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || '{}')
      const requests = [...archiveRequests]
      const requestIndex = requests.findIndex(req => req.id === requestId)
      
      if (requestIndex !== -1) {
        const request = requests[requestIndex]
        
        // Update request status
        requests[requestIndex] = {
          ...request,
          status: 'approved',
          approvedBy: user.username,
          approvedDate: new Date().toLocaleDateString()
        }
        
        // Archive the actual entity
        if (request.type === 'student') {
          await studentService.archiveStudent(request.entityId)
        } else if (request.type === 'teacher') {
          await teacherService.archiveTeacher(request.entityId)
        } else if (request.type === 'course') {
          await courseService.archiveCourse(request.entityId)
        }
        
        // Save updated requests
        localStorage.setItem('archiveRequests', JSON.stringify(requests))
        setArchiveRequests(requests)
        
        if (onArchiveUpdate) {
          onArchiveUpdate()
        }
      }
    } catch (error) {
      console.error('Error approving archive request:', error)
    }
  }

  const handleDenyArchive = async (requestId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || '{}')
      const requests = [...archiveRequests]
      const requestIndex = requests.findIndex(req => req.id === requestId)
      
      if (requestIndex !== -1) {
        const request = requests[requestIndex]
        
        // Update request status
        requests[requestIndex] = {
          ...request,
          status: 'denied',
          approvedBy: user.username,
          approvedDate: new Date().toLocaleDateString()
        }
        
        // If the entity was already archived, unarchive it
        if (request.type === 'student') {
          await studentService.unarchiveStudent(request.entityId)
        } else if (request.type === 'teacher') {
          await teacherService.unarchiveTeacher(request.entityId)
        } else if (request.type === 'course') {
          await courseService.unarchiveCourse(request.entityId)
        }
        
        localStorage.setItem('archiveRequests', JSON.stringify(requests))
        setArchiveRequests(requests)
        
        if (onArchiveUpdate) {
          onArchiveUpdate()
        }
      }
    } catch (error) {
      console.error('Error denying archive request:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'student': return 'default'
      case 'teacher': return 'secondary'
      case 'course': return 'outline'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'denied': return 'destructive'
      case 'pending': return 'secondary'
      default: return 'secondary'
    }
  }

  // Group by month
  const groupedRequests = archiveRequests.reduce((acc: Record<string, ArchiveRequest[]>, request) => {
    const month = new Date(request.requestedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[month]) acc[month] = []
    acc[month].push(request)
    return acc
  }, {})

  if (loading) return <div>Loading archive requests...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Archive className="h-5 w-5 mr-2" />
          Archive Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedRequests).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No archive requests found.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRequests)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([month, requests]) => (
              <div key={month} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">{month}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      {isManager && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests
                      .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime())
                      .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Badge variant={getTypeColor(request.type)}>
                            {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => {
                              if (request.type === 'student') {
                                router.push(`/student/${request.entityId}`)
                              } else if (request.type === 'teacher') {
                                router.push(`/teacher/${request.entityId}`)
                              } else if (request.type === 'course') {
                                router.push(`/course/${request.entityId}`)
                              }
                            }}
                          >
                            {request.entityName}
                          </Button>
                        </TableCell>
                        <TableCell>{request.requestedBy}</TableCell>
                        <TableCell>{new Date(request.requestedDate).toLocaleDateString()}</TableCell>
                        <TableCell>{request.reason || 'No reason provided'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={getStatusColor(request.status)}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                            {request.approvedBy && (
                              <div className="text-xs text-gray-500">
                                By: {request.approvedBy}
                                <br />
                                {request.approvedDate}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        {isManager && (
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApproveArchive(request.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDenyArchive(request.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Deny
                                </Button>
                              </div>
                            )}
                            {request.status === 'denied' && (
                              <span className="text-sm text-gray-500">Request denied</span>
                            )}
                            {request.status === 'approved' && (
                              <span className="text-sm text-gray-500">Archived</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
