// Authentication Service for Kennedy Management System
import { createClient } from '@/lib/supabase/client'

const supabase = createClient();

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
  // NOTE: Invitations intentionally deferred — no invitations table yet
  async signUp(email, password, token, fullName = '', phone = '') {
    // Sign up the user directly (invitation verification deferred)
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
    return { data, invitation: null }
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
  // NOTE: Invitations intentionally deferred — no invitations table yet
  async sendInvitation(email, role) {
    throw new Error('Invitations are not available yet. This feature is coming soon.')
  },

  // Get all invitations created by current user
  // NOTE: Invitations intentionally deferred — no invitations table yet
  async getInvitations() {
    return []
  },

  // Verify invitation token
  // NOTE: Invitations intentionally deferred — no invitations table yet
  async verifyInvitation(token, email) {
    throw new Error('Invitations are not available yet. This feature is coming soon.')
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
  // NOTE: Invitations intentionally deferred — no invitations table yet
  async cancelInvitation(invitationId) {
    throw new Error('Invitations are not available yet. This feature is coming soon.')
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default authService
