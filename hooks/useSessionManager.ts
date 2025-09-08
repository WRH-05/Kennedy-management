import { useEffect, useCallback, useState, useRef } from 'react'
import { validateSession } from '@/utils/supabase-session'
import { supabase } from '@/lib/supabase'

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
      console.log('🔄 Session validation already in progress, skipping...')
      return
    }
    
    if (!force && (now - lastValidationRef.current) < 3000) {
      console.log('🔄 Session validation debounced, skipping...')
      return
    }
    
    console.log('🔄 Starting session validation...', { force, now })
    
    isValidatingRef.current = true
    lastValidationRef.current = now
    setIsValidating(true)
    
    try {
      const session = await validateSession()
      setSessionData(session)
      
      console.log('✅ Session validation result:', {
        valid: session.valid,
        authenticated: session.authenticated,
        hasProfile: !!session.profile,
        needsSetup: session.needsProfileSetup,
        error: session.error
      })
      
      // Handle different session states
      if (!session.valid && session.authenticated) {
        if (session.needsProfileSetup) {
          console.log('👤 User needs profile setup')
        } else if (session.profileInactive) {
          console.warn('🚫 Account is inactive')
        }
      }
    } catch (error) {
      console.error('❌ Session refresh failed:', error)
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
    console.log('🎯 Setting up auth state listener...')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', { event, hasSession: !!session })
        
        // Only refresh on meaningful auth changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log('🔄 Auth state change triggered session refresh')
          await refreshSession(true)
        }
      }
    )

    // Initial session validation on mount
    console.log('🚀 Running initial session validation...')
    refreshSession(true)

    return () => {
      console.log('🧹 Cleaning up auth state listener...')
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
        console.log('🔄 Focus event debounced, skipping session refresh')
        return
      }
      
      lastFocusTime = now
      
      // Clear any existing timeout
      if (focusTimeout) clearTimeout(focusTimeout)
      
      // Debounce to avoid rapid session checks
      focusTimeout = setTimeout(() => {
        console.log('👀 Window focus detected, refreshing session...')
        refreshSession()
      }, 1000) // Increased debounce time
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visibility change detected')
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
