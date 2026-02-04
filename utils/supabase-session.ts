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

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms)
  })
  return Promise.race([promise, timeout])
}

/**
 * Validates the current user session using the database RPC function.
 * This is the single source of truth for session validation.
 */
export async function validateSession(): Promise<SessionResult> {
  try {
    // First check if we have an auth session with timeout
    const { data: { session }, error: sessionError } = await withTimeout(
      supabase.auth.getSession(),
      10000,
      'Session check timed out'
    )
    
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

    // Use the database function for complete session info with timeout
    // Wrap in native Promise for proper timeout handling
    const rpcPromise = new Promise<{ data: any; error: any }>((resolve) => {
      supabase.rpc('get_current_user_session').then(resolve)
    })
    const { data, error } = await withTimeout(
      rpcPromise,
      10000,
      'Profile fetch timed out'
    )
    
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
