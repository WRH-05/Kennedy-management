"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserPlus, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Copy,
  MoreHorizontal,
  UserX,
  XCircle,
  Ban
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

export default function UserManagementTab() {
  const { user: currentUser, hasRole } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'receptionist' as 'manager' | 'receptionist'
  })
  const [sendingInvite, setSendingInvite] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, invitationsData] = await Promise.all([
        authService.getSchoolUsers(),
        authService.getInvitations()
      ])
      setUsers(usersData)
      setInvitations(invitationsData)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to load data',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sendingInvite) return // Prevent double submission
    
    setSendingInvite(true)

    try {
      const result = await authService.sendInvitation(
        inviteForm.email,
        inviteForm.role,
        currentUser?.profile?.full_name || 'System'
      )
      
      if (result.emailSent) {
        toast({
          title: "Invitation Sent",
          description: `Invitation email sent to ${inviteForm.email}!`,
        })
      } else {
        // Copy link to clipboard if email wasn't sent
        try {
          await navigator.clipboard.writeText(result.inviteLink)
          toast({
            title: "Invitation Created",
            description: "Link copied to clipboard (email service not configured).",
          })
        } catch {
          toast({
            title: "Invitation Created",
            description: `Share this link: ${result.inviteLink}`,
          })
        }
      }
      
      setInviteForm({ email: '', role: 'receptionist' })
      setInviteDialogOpen(false)
      await loadData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to send invitation',
        variant: "destructive",
      })
    } finally {
      setSendingInvite(false)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await authService.updateUserRole(userId, newRole)
      toast({
        title: "Role Updated",
        description: "User role updated successfully",
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to update user role',
        variant: "destructive",
      })
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      await authService.deactivateUser(userId)
      toast({
        title: "User Deactivated",
        description: "User deactivated successfully",
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to deactivate user',
        variant: "destructive",
      })
    }
  }

  const copyInviteLink = async (invitation: any) => {
    const link = `${window.location.origin}/auth/signup?token=${invitation.token}&email=${encodeURIComponent(invitation.email)}`
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Copied",
        description: "Invitation link copied to clipboard",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (role: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    
    switch (role) {
      case 'owner':
        return <Badge variant="default">Owner</Badge>
      case 'manager':
        return <Badge variant="secondary">Manager</Badge>
      case 'receptionist':
        return <Badge variant="outline">Receptionist</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getInviteStatusBadge = (invitation: any) => {
    if (invitation.accepted_at) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date()
    if (isExpired) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>
    }
    
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await authService.cancelInvitation(invitationId)
      toast({
        title: "Invitation Canceled",
        description: "Invitation canceled successfully",
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to cancel invitation',
        variant: "destructive",
      })
    }
  }

  const isInvitationActive = (invitation: any) => {
    return !invitation.accepted_at && 
           new Date(invitation.expires_at) > new Date()
  }

  if (!hasRole(['owner', 'manager'])) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to manage users. Only owners and managers can access this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage school staff and send invitations
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value: 'manager' | 'receptionist') => 
                    setInviteForm(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={sendingInvite}>
                <Mail className="mr-2 h-4 w-4" />
                {sendingInvite ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <Mail className="mr-2 h-4 w-4" />
            Invitations ({invitations.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>School Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[455px] overflow-auto scrollbar-thin">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="group">
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(user.role, user.is_active)}</TableCell>
                        <TableCell>
                          {user.invited_by_profile?.full_name || 'System'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between">
                            <Badge variant={user.is_active ? "default" : "destructive"}>
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {user.id !== currentUser?.id && hasRole('owner') && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {user.role !== 'owner' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleUpdateUserRole(user.id, 'manager')}
                                        disabled={user.role === 'manager'}
                                      >
                                        Make Manager
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleUpdateUserRole(user.id, 'receptionist')}
                                        disabled={user.role === 'receptionist'}
                                      >
                                        Make Receptionist
                                      </DropdownMenuItem>
                                      {user.is_active && (
                                        <DropdownMenuItem
                                          onClick={() => handleDeactivateUser(user.id)}
                                          className="text-destructive"
                                        >
                                          <UserX className="mr-2 h-4 w-4" />
                                          Deactivate
                                        </DropdownMenuItem>
                                      )}
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[365px] overflow-auto scrollbar-thin">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id} className="group">
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invitation.role}</Badge>
                        </TableCell>
                        <TableCell>{invitation.invited_by_profile?.full_name}</TableCell>
                        <TableCell>{getInviteStatusBadge(invitation)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between">
                            <span>{new Date(invitation.expires_at).toLocaleDateString()}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {isInvitationActive(invitation) && (
                                  <>
                                    <DropdownMenuItem onClick={() => copyInviteLink(invitation)}>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleCancelInvitation(invitation.id)}
                                      className="text-destructive"
                                    >
                                      <Ban className="mr-2 h-4 w-4" />
                                      Cancel Invitation
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {!isInvitationActive(invitation) && (
                                  <DropdownMenuItem disabled>
                                    No actions available
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
