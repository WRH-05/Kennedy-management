"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, Check, X, Undo, MoreHorizontal, Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { studentService } from "@/services/studentService"
import { teacherService } from "@/services/teacherService"
import { courseInstancesService } from "@/services/courseInstancesService"
import { archiveService } from "@/services/archiveService"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  requested_by_name?: string
  created_at: string
  status: string
  approved_by?: string | null
  approved_by_name?: string
  approved_date?: string | null
  reason?: string | null
  updated_at?: string | null
}

function clearPointerEvents() {
  document.body.style.pointerEvents = ""
  setTimeout(() => {
    document.body.style.pointerEvents = ""
  }, 100)
}

function getEntityHref(request: ArchiveRequest): string {
  if (request.entity_type === "student") return `/student/${request.entity_id}`
  if (request.entity_type === "teacher") return `/teacher/${request.entity_id}`
  if (request.entity_type === "course") return `/course-instance/${request.entity_id}`
  return "#"
}

export default function ArchiveTab({ isManager = false, onArchiveUpdate }: ArchiveTabProps) {
  const [archiveRequests, setArchiveRequests] = useState<ArchiveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<"all" | "student" | "teacher" | "course">("all")
  const [unarchiveTarget, setUnarchiveTarget] = useState<ArchiveRequest | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ArchiveRequest | null>(null)

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
      await loadArchiveRequests()
      onArchiveUpdate?.()
    } catch (error) {
      console.error('Error approving archive request:', error)
      toast({ title: "Error", description: (error as Error)?.message || "Failed to approve archive request.", variant: "destructive" })
      // Rollback on error
      await loadArchiveRequests()
      onArchiveUpdate?.()
    } finally {
      clearPointerEvents()
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
      await loadArchiveRequests()
      onArchiveUpdate?.()
    } catch (error) {
      console.error('Error denying archive request:', (error as Error)?.message ?? error)
      toast({ title: "Error", description: (error as Error)?.message || "Failed to deny archive request.", variant: "destructive" })
      // Rollback on error
      await loadArchiveRequests()
      onArchiveUpdate?.()
    } finally {
      clearPointerEvents()
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  const handleUnarchive = async (request: ArchiveRequest) => {
    try {
      await archiveService.unarchiveEntity(request.id)

      // Reload archive requests
      await loadArchiveRequests()
      onArchiveUpdate?.()

    } catch (error) {
      console.error('Error unarchiving entity:', error)
      toast({ title: "Error", description: (error as Error)?.message || "Failed to unarchive.", variant: "destructive" })
    } finally {
      clearPointerEvents()
    }
  }

  const handleDelete = async (request: ArchiveRequest) => {
    try {
      if (request.entity_type === 'student') {
        await studentService.deleteStudent(request.entity_id)
      } else if (request.entity_type === 'teacher') {
        await teacherService.deleteTeacher(request.entity_id)
      } else if (request.entity_type === 'course') {
        await courseInstancesService.deleteCourseInstance(request.entity_id)
      }
      await archiveService.deleteArchiveRequest(request.id)
      toast({ title: "Entity deleted" })
      await loadArchiveRequests()
      onArchiveUpdate?.()
    } catch (error) {
      console.error('Error permanently deleting entity:', error)
      toast({ title: "Error", description: (error as Error)?.message || "Failed to delete.", variant: "destructive" })
    } finally {
      clearPointerEvents()
      setDeleteTarget(null)
    }
  }

  const pendingRequests = archiveRequests.filter(req => req.status === 'pending')
  const processedRequests = archiveRequests.filter(req => req.status !== 'pending')
  const filteredPending = filterType === "all" ? pendingRequests : pendingRequests.filter(req => req.entity_type === filterType)
  const filteredProcessed = filterType === "all" ? processedRequests : processedRequests.filter(req => req.entity_type === filterType)

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center">
          <Archive className="h-5 w-5 mr-2" />
          Archive Management
        </CardTitle>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as "all" | "student" | "teacher" | "course")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="course">Class Instances</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="max-h-113.75 overflow-auto scrollbar-thin">
        {/* Pending Requests */}
        <div>
          <h3 className="text-lg font-medium mb-4">Pending Archive Requests</h3>
          {filteredPending.length > 0 ? (
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
                {filteredPending.map((request) => (
                  <TableRow key={request.id} className="group">
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={getEntityHref(request)} className="hover:underline">
                        {request.entity_name}
                      </Link>
                    </TableCell>
                    <TableCell>{request.requested_by_name || request.requested_by || 'Unknown'}</TableCell>
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
        {filteredProcessed.length > 0 && (
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
                {filteredProcessed.map((request) => (
                  <TableRow key={request.id} className="opacity-60 group">
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={getEntityHref(request)} className="hover:underline">
                        {request.entity_name}
                      </Link>
                    </TableCell>
                    <TableCell>{request.requested_by_name || request.requested_by || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.approved_by_name || request.approved_by || '-'}</TableCell>
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
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setUnarchiveTarget(request)}
                              >
                                <Undo className="mr-2 h-4 w-4" />
                                Unarchive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(request)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

      <AlertDialog open={!!unarchiveTarget} onOpenChange={(open) => { if (!open) setUnarchiveTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unarchive {unarchiveTarget?.entity_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore {unarchiveTarget?.entity_name} to active lists and search results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUnarchiveTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (unarchiveTarget) {
                  handleUnarchive(unarchiveTarget)
                  setUnarchiveTarget(null)
                }
              }}
            >
              Unarchive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.entity_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              WARNING: This action is permanent and cannot be undone. All associated historical records will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => { if (deleteTarget) handleDelete(deleteTarget) }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
