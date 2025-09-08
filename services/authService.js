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
      console.log('🔍 Getting current user...')
      
      // Step 1: Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ Auth error:', userError)
        return null
      }
      
      if (!user) {
        console.log('👤 No authenticated user found')
        return null
      }

      console.log('✅ User found:', user.id, 'Email confirmed:', !!user.email_confirmed_at)

      // Step 2: Check email confirmation status
      if (!user.email_confirmed_at) {
        console.log('📧 User email not confirmed yet')
        return {
          ...user,
          profile: null,
          needsEmailConfirmation: true
        }
      }

      // Step 3: Get user profile - SIMPLIFIED without timeout
      console.log('🔍 Fetching profile for user:', user.id)
      
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
        console.error('⚠️ Profile fetch error:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
          userId: user.id
        })
        
        // Return user without profile instead of failing
        return {
          ...user,
          profile: null,
          profileError: profileError.message
        }
      }

      if (!profile) {
        console.warn('⚠️ No profile data returned')
        return {
          ...user,
          profile: null
        }
      }

      console.log('✅ Profile found:', profile.id, 'School:', profile.school_id, 'Role:', profile.role)
      return {
        ...user,
        profile
      }
    } catch (error) {
      console.error('💥 Unexpected error in getCurrentUser:', error)
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
    console.log('🏫 Starting school creation process...')
    console.log('School data:', schoolData)
    console.log('User data:', { email: userData.email, full_name: userData.full_name, phone: userData.phone })
    
    try {
      // First create the school using the secure function
      console.log('📝 Step 1: Creating school record...')
      const { data: schoolResult, error: schoolError } = await supabase
        .rpc('create_school_for_registration', {
          school_name: schoolData.name,
          school_address: schoolData.address || null,
          school_phone: schoolData.phone || null,
          school_email: schoolData.email || null
        })

      if (schoolError) {
        console.error('❌ School creation RPC failed:', schoolError)
        throw schoolError
      }

      // Check if the function returned an error
      if (schoolResult?.error) {
        console.error('❌ School creation failed:', schoolResult.message)
        throw new Error(schoolResult.message)
      }

      const school = schoolResult
      console.log('✅ School created successfully:', school.id)

      // Sign up the owner - the trigger function will handle profile creation automatically
      console.log('👤 Step 2: Creating user account...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
            is_owner_signup: true,
            school_id: school.id
          }
        }
      })

      if (authError) {
        console.error('❌ User signup failed:', authError)
        // If user creation fails, clean up the school
        console.log('🧹 Cleaning up school record...')
        await supabase.from('schools').delete().eq('id', school.id)
        throw authError
      }
      console.log('✅ User created successfully:', authData.user.id)

      // Wait for the trigger to complete profile creation
      console.log('⏳ Step 3: Waiting for profile creation...')
      let profile = null
      let attempts = 0
      const maxAttempts = 10

      while (!profile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log(`🔍 Attempt ${attempts + 1}/${maxAttempts}: Checking for profile...`)
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
          console.log('✅ Profile found via trigger!')
          break
        } else if (profileError) {
          console.log('⚠️ Profile query error:', profileError.message)
        }
        
        attempts++
        console.log(`Waiting for profile creation, attempt ${attempts}/${maxAttempts}`)
      }

      if (!profile) {
        console.warn('Profile not created by trigger, creating manually...')
        // Create profile manually if trigger failed
        const { data: manualProfile, error: manualError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            school_id: school.id,
            role: 'owner',
            full_name: userData.full_name,
            phone: userData.phone,
            is_active: true
          }])
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

        if (manualError) {
          console.error('Failed to create profile manually:', manualError)
          throw new Error('Failed to create user profile')
        }
        
        profile = manualProfile
      }

      console.log('School and owner created successfully:', { school: school.id, user: authData.user.id, profile: profile.id })
      return { school, user: authData.user, profile }
    } catch (error) {
      // Enhanced error logging for better debugging
      console.error('Error creating school and owner:')
      console.error('- Error message:', error?.message || 'No message')
      console.error('- Error details:', error?.details || 'No details')
      console.error('- Error hint:', error?.hint || 'No hint')
      console.error('- Error code:', error?.code || 'No code')
      console.error('- Full error object:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        name: error?.name,
        stack: error?.stack?.substring(0, 200) + '...' // Truncate stack trace
      })
      
      // Create a more descriptive error message
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
