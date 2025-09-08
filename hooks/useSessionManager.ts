import { useEffect, useCallback, useState, useRef } from 'react'
import { validateSession } from '@/utils/supabase-session'
import { supabase } from '@/lib/supabase'

// Enable debug logging in development
const DEBUG_SESSION = process.env.NODE_ENV === 'development'

interface SessionData {
  valid: boolean
  authenticated: boolean
  user: any
  profile: any
  school: any
  needsProfileSetup?: boolean
  profileInactive?: boolean
  error?: string | null
}

export function useSessionManager() {
  const [isValidating, setIsValidating] = useState(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const lastValidationRef = useRef<number>(0)
  const isValidatingRef = useRef<boolean>(false)
  
  // Use useRef to avoid dependency issues
  const refreshSession = useCallback(async (force = false) => {
    const now = Date.now()
    
    // Debounce: don't validate more than once every 3 seconds unless forced
    if (!force && isValidatingRef.current) {
      if (DEBUG_SESSION) console.log('Session validation already in progress, skipping...')
      return
    }
    
    if (!force && (now - lastValidationRef.current) < 3000) {
      if (DEBUG_SESSION) console.log('Session validation debounced, skipping...')
      return
    }
    
    if (DEBUG_SESSION) console.log('Starting session validation...', { force, now })
    
    isValidatingRef.current = true
    lastValidationRef.current = now
    setIsValidating(true)
    
    try {
      const session = await validateSession()
      setSessionData(session)
      
      if (DEBUG_SESSION) {
        console.log('Session validation result:', {
          valid: session.valid,
          authenticated: session.authenticated,
          hasProfile: !!session.profile,
          needsSetup: (session as any).needsProfileSetup,
          error: session.error
        })
      }
      
      // Handle different session states
      if (!session.valid && session.authenticated) {
        if ((session as any).needsProfileSetup) {
          if (DEBUG_SESSION) console.log('User needs profile setup')
        } else if ((session as any).profileInactive) {
          if (DEBUG_SESSION) console.warn('Account is inactive')
        }
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      setSessionData({
        valid: false,
        authenticated: false,
        user: null,
        profile: null,
        school: null,
        error: error instanceof Error ? error.message : 'Session validation failed'
      })
    } finally {
      isValidatingRef.current = false
      setIsValidating(false)
    }
  }, []) // Remove dependencies to prevent infinite loops

  // Supabase auth state change listener
  useEffect(() => {
    if (DEBUG_SESSION) console.log('Setting up auth state listener...')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (DEBUG_SESSION) console.log('Auth state changed:', { event, hasSession: !!session })
        
        // Only refresh on meaningful auth changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (DEBUG_SESSION) console.log('Auth state change triggered session refresh')
          await refreshSession(true)
        }
      }
    )

    // Initial session validation on mount
    if (DEBUG_SESSION) console.log('Running initial session validation...')
    refreshSession(true)

    return () => {
      if (DEBUG_SESSION) console.log('Cleaning up auth state listener...')
      subscription.unsubscribe()
    }
  }, [refreshSession])

  // Window focus/visibility handlers (less aggressive)
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout
    let lastFocusTime = 0

    const handleFocus = () => {
      const now = Date.now()
      
      // Only refresh if it's been more than 30 seconds since last focus
      if (now - lastFocusTime < 30000) {
        if (DEBUG_SESSION) console.log('Focus event debounced, skipping session refresh')
        return
      }
      
      lastFocusTime = now
      
      // Clear any existing timeout
      if (focusTimeout) clearTimeout(focusTimeout)
      
      // Debounce to avoid rapid session checks
      focusTimeout = setTimeout(() => {
        if (DEBUG_SESSION) console.log('Window focus detected, refreshing session...')
        refreshSession()
      }, 1000) // Increased debounce time
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (DEBUG_SESSION) console.log('Page visibility change detected')
        handleFocus()
      }
    }

    // Only add listeners if window is available (client-side)
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      if (focusTimeout) clearTimeout(focusTimeout)
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [refreshSession])

  return {
    sessionData,
    isValidating,
    refreshSession
  }
}
