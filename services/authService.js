// Authentication Service for Kennedy Management System
import { supabase } from '../lib/supabase'

export const authService = {
  // Get current user session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  },

  // Get current user with profile and school info
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return null

      // Check if user email is confirmed first
      if (!user.email_confirmed_at) {
        console.log('User email not confirmed yet')
        return {
          ...user,
          profile: null,
          needsEmailConfirmation: true
        }
      }

      // Get user profile with school info - with better error handling
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          schools (
            id,
            name,
            address,
            phone,
            email,
            logo_url
          )
        `)
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('Profile not found for user:', user.id, profileError.message)
        // Return user without profile if profile doesn't exist yet
        return {
          ...user,
          profile: null
        }
      }

      return {
        ...user,
        profile
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      // Return null on error to prevent infinite loading
      return null
    }
  },

  // Sign up new user (only via invitation)
  async signUp(email, password, token) {
    try {
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
          data: {
            invitation_token: token
          }
        }
      })

      if (error) throw error
      return { data, invitation }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  // Create a new school (owner registration)
  async createSchoolAndOwner(schoolData, userData, password) {
    try {
      // First create the school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single()

      if (schoolError) throw schoolError

      // Sign up the owner - the trigger function will handle profile creation automatically
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
            is_owner_signup: true,
            school_id: school.id
          }
        }
      })

      if (authError) {
        // If user creation fails, clean up the school
        await supabase.from('schools').delete().eq('id', school.id)
        throw authError
      }

      // Wait a moment for the trigger to complete, then get the profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.warn('Profile not found immediately after creation, this is normal:', profileError)
        // Return without profile for now - it should be created by the trigger
        return { school, user: authData.user, profile: null }
      }

      return { school, user: authData.user, profile }
    } catch (error) {
      console.error('Error creating school and owner:', error)
      throw error
    }
  },

  // Send invitation
  async sendInvitation(email, role, inviterName) {
    try {
      // Get current user's school
      const currentUser = await this.getCurrentUser()
      if (!currentUser?.profile?.school_id) {
        throw new Error('User not associated with a school')
      }

      // Check if user has permission to invite
      if (!['owner', 'manager'].includes(currentUser.profile.role)) {
        throw new Error('Only owners and managers can send invitations')
      }

      // Check if invitation already exists
      const { data: existingInvite } = await supabase
        .from('invitations')
        .select('*')
        .eq('email', email)
        .eq('school_id', currentUser.profile.school_id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())

      if (existingInvite && existingInvite.length > 0) {
        throw new Error('Invitation already sent to this email')
      }

      // Create invitation
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert([{
          email,
          role,
          school_id: currentUser.profile.school_id,
          invited_by: currentUser.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }])
        .select()
        .single()

      if (error) throw error

      // TODO: Send email with invitation link
      // For now, return the invitation token for manual sharing
      const inviteLink = `${window.location.origin}/auth/signup?token=${invitation.token}&email=${encodeURIComponent(email)}`
      
      return { invitation, inviteLink }
    } catch (error) {
      console.error('Error sending invitation:', error)
      throw error
    }
  },

  // Get all invitations for current school
  async getInvitations() {
    try {
      const currentUser = await this.getCurrentUser()
      if (!currentUser?.profile?.school_id) return []

      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          invited_by_profile:profiles!invitations_invited_by_fkey (
            full_name
          )
        `)
        .eq('school_id', currentUser.profile.school_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting invitations:', error)
      return []
    }
  },

  // Verify invitation token
  async verifyInvitation(token, email) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          schools (name),
          invited_by_profile:profiles!invitations_invited_by_fkey (
            full_name
          )
        `)
        .eq('token', token)
        .eq('email', email)
        .gt('expires_at', new Date().toISOString())
        .is('accepted_at', null)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error verifying invitation:', error)
      return null
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
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
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  // Get all users in current school
  async getSchoolUsers() {
    try {
      const currentUser = await this.getCurrentUser()
      if (!currentUser?.profile?.school_id) return []

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          invited_by_profile:profiles!profiles_invited_by_fkey (
            full_name
          )
        `)
        .eq('school_id', currentUser.profile.school_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting school users:', error)
      return []
    }
  },

  // Update user role (owners and managers only)
  async updateUserRole(userId, newRole) {
    try {
      const currentUser = await this.getCurrentUser()
      if (!['owner', 'manager'].includes(currentUser?.profile?.role)) {
        throw new Error('Only owners and managers can update user roles')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .eq('school_id', currentUser.profile.school_id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  },

  // Deactivate user (owners and managers only)
  async deactivateUser(userId) {
    try {
      const currentUser = await this.getCurrentUser()
      if (!['owner', 'manager'].includes(currentUser?.profile?.role)) {
        throw new Error('Only owners and managers can deactivate users')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId)
        .eq('school_id', currentUser.profile.school_id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error deactivating user:', error)
      throw error
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default authService
