// Authentication Service for Kennedy Management System
import { supabase } from '@/lib/supabase'

// Conditional debug logging
const DEBUG = process.env.NODE_ENV === 'development'
const log = (...args) => DEBUG && console.log(...args)
const warn = (...args) => DEBUG && console.warn(...args)

export const authService = {
  // Get current user session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get current user with profile info
  async getCurrentUser() {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    // Check email confirmation status
    if (!user.email_confirmed_at) {
      return {
        ...user,
        profile: null,
        needsEmailConfirmation: true
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return {
        ...user,
        profile: null,
        profileError: profileError.message
      }
    }

    if (!profile) {
      return {
        ...user,
        profile: null
      }
    }

    return {
      ...user,
      profile
    }
  },

  // Sign up new user (via invitation token)
  async signUp(email, password, token, fullName = '', phone = '') {
    // First verify the invitation token
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .gt('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .single()

    if (inviteError || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          invitation_token: token,
          full_name: fullName || 'Invited User',
          phone: phone || null
        }
      }
    })

    if (error) throw error
    return { data, invitation }
  },

  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  },

  // Send invitation
  async sendInvitation(email, role) {
    // Get current user
    const currentUser = await this.getCurrentUser()
    if (!currentUser?.id) {
      throw new Error('User not authenticated')
    }

    // Check if user has permission to invite
    if (!['manager', 'receptionist'].includes(currentUser.profile?.role)) {
      throw new Error('Only managers and receptionists can send invitations')
    }

    // Validate role - ensure it's a valid user_role enum value
    const validRoles = ['manager', 'receptionist']
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be "manager" or "receptionist"')
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if invitation already exists (exclude accepted)
    const { data: existingInvite, error: checkError } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', normalizedEmail)
      .is('accepted_at', null)

    if (checkError) {
      console.error('Error checking existing invitations:', checkError)
    }

    // Check for pending (non-expired) invitations
    const pendingInvite = existingInvite?.find(inv => new Date(inv.expires_at) > new Date())
    if (pendingInvite) {
      throw new Error('An active invitation already exists for this email')
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert([{
        email: normalizedEmail,
        role: role,
        invited_by: currentUser.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }])
      .select()
      .single()

    if (error) {
      console.error('Invitation creation error:', error)
      // Handle unique constraint violation
      if (error.code === '23505') {
        throw new Error('An invitation already exists for this email')
      }
      throw new Error(`Failed to create invitation: ${error.message}`)
    }

    // Create invitation link
    const inviteLink = `${window.location.origin}/auth/signup?token=${invitation.token}&email=${encodeURIComponent(normalizedEmail)}`

    return { invitation, inviteLink, emailSent: false }
  },

  // Get all invitations created by current user
  async getInvitations() {
    const currentUser = await this.getCurrentUser()
    if (!currentUser?.id) return []

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('invited_by', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enrich with inviter name
    const enriched = await Promise.all(
      (data || []).map(async (invite) => {
        if (invite.invited_by) {
          const { data: inviter } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', invite.invited_by)
            .single()
          return { ...invite, invited_by_profile: inviter }
        }
        return { ...invite, invited_by_profile: null }
      })
    )

    return enriched
  },

  // Verify invitation token
  async verifyInvitation(token, email) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('email', email.toLowerCase().trim())
      .gt('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .single()

    if (error) throw error

    // Enrich with inviter name
    if (data && data.invited_by) {
      const { data: inviter } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.invited_by)
        .single()
      return { ...data, invited_by_profile: inviter }
    }

    return data ? { ...data, invited_by_profile: null } : null
  },

  // Update user profile
  async updateProfile(updates) {
    const currentUser = await this.getCurrentUser()
    if (!currentUser?.id) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all users
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Update user role (managers only)
  async updateUserRole(userId, newRole) {
    const currentUser = await this.getCurrentUser()
    if (currentUser?.profile?.role !== 'manager') {
      throw new Error('Only managers can update user roles')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Deactivate user (managers only)
  async deactivateUser(userId) {
    const currentUser = await this.getCurrentUser()
    if (currentUser?.profile?.role !== 'manager') {
      throw new Error('Only managers can deactivate users')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Cancel invitation (managers only)
  async cancelInvitation(invitationId) {
    const currentUser = await this.getCurrentUser()
    if (currentUser?.profile?.role !== 'manager') {
      throw new Error('Only managers can cancel invitations')
    }

    const { data, error } = await supabase
      .from('invitations')
      .update({ canceled_at: new Date().toISOString() })
      .eq('id', invitationId)
      .is('accepted_at', null)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default authService
