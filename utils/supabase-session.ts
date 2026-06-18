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

// Global state trackers for deduplication & memory cache
let cachedSessionResult: SessionResult | null = null
let lastFetchTime = 0
let pendingRequest: Promise<SessionResult> | null = null

const CACHE_TTL = 60000 // 60 seconds

export function clearSessionCache() {
  cachedSessionResult = null
  lastFetchTime = 0
  pendingRequest = null
}

export async function validateSession(skipCache = false): Promise<SessionResult> {
  const now = Date.now()

  // 1. Use memory cache if it's still fresh and we aren't bypassing it
  if (!skipCache && cachedSessionResult && (now - lastFetchTime) < CACHE_TTL) {
    return cachedSessionResult
  }

  // 2. Deduplicate simultaneous inflight requests
  if (pendingRequest) {
    return pendingRequest
  }

  pendingRequest = (async (): Promise<SessionResult> => {
    try {
      // Supabase getSession() uses local storage instantly unless expired.
      // If network fails or is slow, it gracefully handles it internally.
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        const unauthResult = { valid: false, authenticated: false, user: null, profile: null, school: null, permissions: null, error: null }
        cachedSessionResult = unauthResult
        return unauthResult
      }

      // 3. Request complete user metrics via your unified RPC function
      // pass abort signal or timeout directly to supabase configuration if necessary, 
      // otherwise rely on standard HTTP client timeouts.
      const { data, error: rpcError } = await supabase.rpc('get_current_user_session')

      if (rpcError) {
        // Fallback safety: If network dropped but we have a valid cache, return it
        if (cachedSessionResult?.valid) {
          return { ...cachedSessionResult, error: 'Network lagging, using cached profile.' }
        }
        throw new Error(rpcError.message)
      }

      const hasValidProfile = data?.profile && data?.authenticated && !data?.profile_inactive

      const successResult: SessionResult = {
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

      cachedSessionResult = successResult
      lastFetchTime = Date.now()
      return successResult

    } catch (err: any) {
      console.error('Session validation lifecycle error:', err)
      
      // Critical fail: return default failure context
      return {
        valid: false,
        authenticated: false,
        user: null,
        profile: null,
        school: null,
        permissions: null,
        error: err.message || 'Unknown network error'
      }
    } finally {
      pendingRequest = null
    }
  })()

  return pendingRequest
}