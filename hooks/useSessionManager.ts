import { useEffect, useCallback, useState } from 'react'
import { validateSession } from '@/utils/supabase-session'

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
  const [lastValidation, setLastValidation] = useState<number>(0)

  const refreshSession = useCallback(async (force = false) => {
    const now = Date.now()
    
    // Debounce: don't validate more than once every 2 seconds unless forced
    if (!force && isValidating) return
    if (!force && (now - lastValidation) < 2000) return
    
    setIsValidating(true)
    setLastValidation(now)
    
    try {
      const session = await validateSession()
      setSessionData(session)
      
      console.log('Session validation result:', {
        valid: session.valid,
        authenticated: session.authenticated,
        hasProfile: !!session.profile,
        needsSetup: session.needsProfileSetup,
        error: session.error
      })
      
      // Handle different session states
      if (!session.valid && session.authenticated) {
        if (session.needsProfileSetup) {
          console.log('User needs profile setup')
          // Could redirect to profile setup page
        } else if (session.profileInactive) {
          console.warn('Account is inactive')
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
      setIsValidating(false)
    }
  }, [isValidating, lastValidation])

  // Handle window focus events (when user switches back to tab)
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout

    const handleFocus = () => {
      // Clear any existing timeout
      if (focusTimeout) clearTimeout(focusTimeout)
      
      // Debounce to avoid rapid session checks
      focusTimeout = setTimeout(() => {
        console.log('Window focus detected, refreshing session...')
        refreshSession()
      }, 500)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visibility change detected, refreshing session...')
        handleFocus()
      }
    }

    // Listen for focus and visibility changes
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial validation on mount
    refreshSession(true)

    return () => {
      if (focusTimeout) clearTimeout(focusTimeout)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshSession])

  return {
    sessionData,
    isValidating,
    refreshSession
  }
}
