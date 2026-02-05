// Authentication Service for Kennedy Management System
import { supabase } from '../lib/supabase'

// Conditional debug logging
const DEBUG = process.env.NODE_ENV === 'development'
const log = (...args) => DEBUG && console.log(...args)
const warn = (...args) => DEBUG && console.warn(...args)

export const authService = {
  // Get current user session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      return null
    }
  },

  // Get current user with profile and school info
  async getCurrentUser() {
    try {
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
    } catch (error) {
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            invitation_token: token
          }
        }
      })

      if (error) throw error
      return { data, invitation }
    } catch (error) {
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
      throw error
    }
  },

  // Create a new school (owner registration)
  // Expected schoolData: { name, address, phone, email } - all required by database
  // Expected userData: { email, full_name, phone } - all required
  async createSchoolAndOwner(schoolData, userData, password) {
    log('Starting school creation process...')
    
    try {
      // Validate required school fields (per database schema requirements)
      const requiredSchoolFields = ['name', 'address', 'phone', 'email']
      const missingFields = requiredSchoolFields.filter(field => 
        !schoolData[field] || schoolData[field].trim() === ''
      )
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required school fields: ${missingFields.join(', ')}`)
      }

      // Validate required user fields
      const requiredUserFields = ['email', 'full_name', 'phone']
      const missingUserFields = requiredUserFields.filter(field => 
        !userData[field] || userData[field].trim() === ''
      )
      
      if (missingUserFields.length > 0) {
        throw new Error(`Missing required user fields: ${missingUserFields.join(', ')}`)
      }

      // Use the SECURITY DEFINER function to create school (bypasses RLS)
      log('Creating school via RPC function...')
      const { data: schoolId, error: schoolError } = await supabase
        .rpc('create_school_for_owner', {
          p_school_name: schoolData.name.trim(),
          p_school_address: schoolData.address.trim(),
          p_school_phone: schoolData.phone.trim(),
          p_school_email: schoolData.email.trim()
        })

      if (schoolError) {
        console.error('School creation failed:', schoolError)
        throw schoolError
      }

      if (!schoolId) {
        throw new Error('School creation returned no ID')
      }

      log('School created:', schoolId)

      // Now sign up the user with school_id in metadata
      log('Creating user account...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            is_owner_signup: 'true',
            school_id: schoolId,
            full_name: userData.full_name,
            phone: userData.phone
          }
        }
      })

      if (authError) {
        // If user creation fails, we should clean up the school
        // But since we might not have permissions, just throw the error
        console.error('User signup failed:', authError)
        throw authError
      }

      log('User created:', authData.user?.id)

      // The profile will be created by database trigger on user signup
      // We don't need to wait or fetch it here because:
      // 1. The user needs to confirm their email first
      // 2. RLS policies prevent reading profile before email confirmation
      // 3. The profile creation happens via trigger which bypasses RLS
      
      // Just verify the trigger ran by calling the manual creation as backup
      // This RPC function will either create the profile or return success if it exists
      const { error: profileError } = await supabase
        .rpc('create_owner_profile_manual', {
          p_user_id: authData.user.id,
          p_school_id: schoolId,
          p_full_name: userData.full_name,
          p_phone: userData.phone
        })

      if (profileError) {
        warn('Profile creation backup failed (may already exist):', profileError.message)
        // This is not critical - the trigger may have already created it
      }

      log('School and owner created:', schoolId)
      
      // Return minimal data - profile will be loaded after email confirmation
      return { 
        school: { id: schoolId }, 
        user: authData.user, 
        profile: null, // Will be loaded after email confirmation
        needsEmailConfirmation: true
      }
    } catch (error) {
      const errorMessage = error?.message || error?.details || 'Failed to create school and owner'
      throw new Error(`School creation failed: ${errorMessage}`)
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

      // Validate role - ensure it's a valid user_role enum value
      const validRoles = ['manager', 'receptionist']
      if (!validRoles.includes(role)) {
        throw new Error('Invalid role. Must be "manager" or "receptionist"')
      }

      // Check if invitation already exists
      const { data: existingInvite, error: checkError } = await supabase
        .from('invitations')
        .select('*')
        .eq('email', email)
        .eq('school_id', currentUser.profile.school_id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())

      if (checkError) {
        console.error('Error checking existing invitations:', checkError)
      }

      if (existingInvite && existingInvite.length > 0) {
        throw new Error('Invitation already sent to this email')
      }

      // Create invitation
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert([{
          email: email.toLowerCase().trim(),
          role: role,
          school_id: currentUser.profile.school_id,
          invited_by: currentUser.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }])
        .select()
        .single()

      if (error) {
        console.error('Invitation creation error:', error)
        throw new Error(`Failed to create invitation: ${error.message}`)
      }

      // Return invitation link for manual sharing
      const inviteLink = `${window.location.origin}/auth/signup?token=${invitation.token}&email=${encodeURIComponent(email)}`
      
      return { invitation, inviteLink }
    } catch (error) {
      console.error('sendInvitation error:', error)
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
      throw error
    }
  },

  // Get all users in current school
  async getSchoolUsers() {
    try {
      const currentUser = await this.getCurrentUser()
      if (!currentUser?.profile?.school_id) return []

      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', currentUser.profile.school_id)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError
      
      // Then enrich with invited_by names (self-reference workaround)
      const enrichedProfiles = await Promise.all(
        (profiles || []).map(async (profile) => {
          if (profile.invited_by) {
            const { data: inviter } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', profile.invited_by)
              .single()
            return { ...profile, invited_by_profile: inviter }
          }
          return { ...profile, invited_by_profile: null }
        })
      )
      
      return enrichedProfiles
    } catch (error) {
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
      throw error
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default authService
