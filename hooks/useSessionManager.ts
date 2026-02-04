import { useEffect, useCallback, useState, useRef } from 'react'
import { validateSession, SessionResult } from '@/utils/supabase-session'
import { supabase } from '@/lib/supabase'

const DEBOUNCE_MS = 3000
const FOCUS_DEBOUNCE_MS = 30000

export function useSessionManager() {
  const [isValidating, setIsValidating] = useState(true)
  const [sessionData, setSessionData] = useState<SessionResult | null>(null)
  const lastValidationRef = useRef<number>(0)
  const isValidatingRef = useRef<boolean>(false)
  const mountedRef = useRef<boolean>(true)
  
  const refreshSession = useCallback(async (force = false) => {
    const now = Date.now()
    
    // Prevent concurrent validations
    if (!force && isValidatingRef.current) {
      return
    }
    
    // Debounce non-forced calls
    if (!force && (now - lastValidationRef.current) < DEBOUNCE_MS) {
      return
    }
    
    isValidatingRef.current = true
    lastValidationRef.current = now
    setIsValidating(true)
    
    try {
      const session = await validateSession()
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setSessionData(session)
      }
    } catch (error) {
      if (mountedRef.current) {
        setSessionData({
          valid: false,
          authenticated: false,
          user: null,
          profile: null,
          school: null,
          permissions: null,
          error: error instanceof Error ? error.message : 'Session validation failed'
        })
      }
    } finally {
      isValidatingRef.current = false
      if (mountedRef.current) {
        setIsValidating(false)
      }
    }
  }, [])

  // Auth state change listener
  useEffect(() => {
    mountedRef.current = true
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        // Only refresh on meaningful auth changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          await refreshSession(true)
        }
      }
    )

    // Initial session validation
    refreshSession(true)

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [refreshSession])

  // Window focus handler (less aggressive)
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout
    let lastFocusTime = 0

    const handleFocus = () => {
      const now = Date.now()
      
      // Only refresh if enough time has passed
      if (now - lastFocusTime < FOCUS_DEBOUNCE_MS) {
        return
      }
      
      lastFocusTime = now
      
      if (focusTimeout) clearTimeout(focusTimeout)
      
      focusTimeout = setTimeout(() => {
        refreshSession()
      }, 1000)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus()
      }
    }

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
