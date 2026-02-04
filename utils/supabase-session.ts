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

// Session cache to avoid repeated validation
let sessionCache: { data: SessionResult | null; timestamp: number } = { data: null, timestamp: 0 }
const CACHE_TTL = 30000 // 30 seconds cache

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms)
  })
  return Promise.race([promise, timeout])
}

/**
 * Clear session cache (call on sign out)
 */
export function clearSessionCache() {
  sessionCache = { data: null, timestamp: 0 }
}

/**
 * Validates the current user session using the database RPC function.
 * This is the single source of truth for session validation.
 */
export async function validateSession(skipCache = false): Promise<SessionResult> {
  // Check cache first (unless forced refresh)
  const now = Date.now()
  if (!skipCache && sessionCache.data && (now - sessionCache.timestamp) < CACHE_TTL) {
    return sessionCache.data
  }

  try {
    // First check if we have an auth session with timeout (increased to 15s)
    const { data: { session }, error: sessionError } = await withTimeout(
      supabase.auth.getSession(),
      15000,
      'Session check timed out'
    )
    
    if (sessionError || !session) {
      const result = { 
        valid: false, 
        authenticated: false,
        user: null, 
        profile: null, 
        school: null,
        permissions: null,
        error: null 
      }
      sessionCache = { data: result, timestamp: now }
      return result
    }

    // Use the database function for complete session info with timeout (increased to 15s)
    // Wrap in native Promise for proper timeout handling
    const rpcPromise = new Promise<{ data: any; error: any }>((resolve) => {
      supabase.rpc('get_current_user_session').then(resolve)
    })
    const { data, error } = await withTimeout(
      rpcPromise,
      15000,
      'Profile fetch timed out'
    )
    
    if (error) {
      // If RPC fails but we have auth, return partial session (don't block UI)
      const result = { 
        valid: false, 
        authenticated: true,
        user: session.user, 
        profile: null, 
        school: null,
        permissions: null,
        error: null // Don't show error to user, just treat as needs refresh
      }
      // Don't cache errors - allow retry
      return result
    }

    // Map the database response to our session format
    const hasValidProfile = data?.profile && data?.authenticated && !data?.profile_inactive
    
    const result = {
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
    
    // Cache successful result
    sessionCache = { data: result, timestamp: now }
    return result
    
  } catch (error: any) {
    // On timeout or network error, return cached data if available (graceful degradation)
    if (sessionCache.data && sessionCache.data.valid) {
      return { ...sessionCache.data, error: null }
    }
    
    // Only return error if we have no cached valid session
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
