import { supabase } from '@/lib/supabase'

export interface SessionResult {
  valid: boolean
  authenticated: boolean
  user: any
  profile: any
  school: any
  permissions: any
  needsProfileSetup?: boolean
  profileInactive?: boolean
  error?: string | null
}

/**
 * Validates the current user session using the database RPC function.
 * This is the single source of truth for session validation.
 */
export async function validateSession(): Promise<SessionResult> {
  try {
    // First check if we have an auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return { 
        valid: false, 
        authenticated: false,
        user: null, 
        profile: null, 
        school: null,
        permissions: null,
        error: null 
      }
    }

    // Use the database function for complete session info
    const { data, error } = await supabase.rpc('get_current_user_session')
    
    if (error) {
      return { 
        valid: false, 
        authenticated: true,
        user: session.user, 
        profile: null, 
        school: null,
        permissions: null,
        error: error.message 
      }
    }

    // Map the database response to our session format
    const hasValidProfile = data?.profile && data?.authenticated && !data?.profile_inactive
    
    return {
      valid: hasValidProfile,
      authenticated: data?.authenticated || false,
      user: session.user,
      profile: data?.profile || null,
      school: data?.school || null,
      permissions: data?.permissions || null,
      needsProfileSetup: data?.needs_profile_setup || false,
      profileInactive: data?.profile_inactive || false,
      error: null
    }
    
  } catch (error: any) {
    return { 
      valid: false, 
      authenticated: false,
      user: null, 
      profile: null, 
      school: null,
      permissions: null,
      error: error.message 
    }
  }
}
