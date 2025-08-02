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
  UserX
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function UserManagementTab() {
  const { user: currentUser, hasRole } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'receptionist' as 'manager' | 'receptionist'
  })

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
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const result = await authService.sendInvitation(
        inviteForm.email,
        inviteForm.role,
        currentUser?.profile?.full_name || 'System'
      )
      
      setSuccess(`Invitation sent! Share this link: ${result.inviteLink}`)
      setInviteForm({ email: '', role: 'receptionist' })
      setInviteDialogOpen(false)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await authService.updateUserRole(userId, newRole)
      setSuccess('User role updated successfully')
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to update user role')
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      await authService.deactivateUser(userId)
      setSuccess('User deactivated successfully')
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate user')
    }
  }

  const copyInviteLink = async (invitation: any) => {
    const link = `${window.location.origin}/auth/signup?token=${invitation.token}&email=${encodeURIComponent(invitation.email)}`
    try {
      await navigator.clipboard.writeText(link)
      setSuccess('Invitation link copied to clipboard')
    } catch {
      setError('Failed to copy link')
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
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>
    }
    
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
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
              
              <Button type="submit" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.id}</TableCell> {/* This would be the email from auth.users */}
                      <TableCell>{getStatusBadge(user.role, user.is_active)}</TableCell>
                      <TableCell>
                        {user.invited_by_profile?.full_name || 'System'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "destructive"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.id !== currentUser?.id && hasRole('owner') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.role}</Badge>
                      </TableCell>
                      <TableCell>{invitation.invited_by_profile?.full_name}</TableCell>
                      <TableCell>{getInviteStatusBadge(invitation)}</TableCell>
                      <TableCell>
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {!invitation.accepted_at && new Date(invitation.expires_at) > new Date() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyInviteLink(invitation)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
