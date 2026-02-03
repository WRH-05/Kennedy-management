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

      // Wait for the trigger to complete profile creation
      let profile = null
      let attempts = 0
      const maxAttempts = 8

      while (!profile && attempts < maxAttempts) {
        const delay = Math.min(100 * Math.pow(2, attempts), 2000)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        const { data: profileData, error: profileError } = await supabase
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
          .eq('id', authData.user.id)
          .single()

        if (!profileError && profileData) {
          profile = profileData
          break
        }
        
        attempts++
      }

      if (!profile) {
        warn('Profile not created by trigger, creating manually...')
        // Use the helper function to create profile manually (bypasses RLS)
        const { data: manualResult, error: manualError } = await supabase
          .rpc('create_owner_profile_manual', {
            p_user_id: authData.user.id,
            p_school_id: schoolId,
            p_full_name: userData.full_name,
            p_phone: userData.phone
          })

        if (manualError) {
          // Ultimate fallback: Direct profile insertion
          try {
            const { data: directProfile, error: directError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                full_name: userData.full_name,
                phone: userData.phone || null,
                role: 'owner',
                school_id: schoolId,
                is_active: true
              })
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
              .single()
              
            if (directError) {
              throw new Error('All profile creation methods failed')
            }
            
            profile = directProfile
          } catch (directInsertError) {
            throw new Error('Failed to create user profile after multiple attempts')
          }
        }
        
        // If we used RPC method and it succeeded, get the profile data
        if (!profile && manualResult && manualResult.success) {
          const { data: profileData, error: profileError } = await supabase
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
            .eq('id', authData.user.id)
            .single()
            
          if (profileError) {
            throw new Error('Failed to retrieve user profile after creation')
          }
          
          profile = profileData
        }
        
        if (!profile) {
          throw new Error('Profile creation failed through all methods')
        }
      }

      log('School and owner created:', schoolId)
      return { school: { id: schoolId }, user: authData.user, profile }
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
