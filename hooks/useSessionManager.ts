import { useEffect, useCallback, useState, useRef } from 'react'
import { validateSession, SessionResult, clearSessionCache } from '@/utils/supabase-session'
import { supabase } from '@/lib/supabase'

const DEBOUNCE_MS = 5000
const FOCUS_DEBOUNCE_MS = 60000
const RETRY_DELAY_MS = 2000
const MAX_RETRIES = 2

export function useSessionManager() {
  const [isValidating, setIsValidating] = useState(true)
  const [sessionData, setSessionData] = useState<SessionResult | null>(null)
  const lastValidationRef = useRef<number>(0)
  const isValidatingRef = useRef<boolean>(false)
  const mountedRef = useRef<boolean>(true)
  const retryCountRef = useRef<number>(0)
  const initialLoadDoneRef = useRef<boolean>(false)
  
  // Use ref to track sessionData without causing re-renders
  const sessionDataRef = useRef<SessionResult | null>(null)
  sessionDataRef.current = sessionData
  
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
    
    // Only show loading on initial load
    if (!initialLoadDoneRef.current) {
      setIsValidating(true)
    }
    
    try {
      const session = await validateSession(force)
      
      if (mountedRef.current) {
        initialLoadDoneRef.current = true
        
        // Reset retry count on success
        if (session.valid || !session.authenticated) {
          retryCountRef.current = 0
        }
        
        // Retry on error if not exhausted
        if (session.error && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++
          setTimeout(() => {
            if (mountedRef.current) {
              refreshSession(true)
            }
          }, RETRY_DELAY_MS)
          return
        }
        
        setSessionData(session)
      }
    } catch (error) {
      if (mountedRef.current) {
        initialLoadDoneRef.current = true
        
        if (retryCountRef.current >= MAX_RETRIES) {
          setSessionData({
            valid: false,
            authenticated: false,
            user: null,
            profile: null,
            school: null,
            permissions: null,
            error: error instanceof Error ? error.message : 'Session validation failed'
          })
        } else {
          retryCountRef.current++
          setTimeout(() => {
            if (mountedRef.current) {
              refreshSession(true)
            }
          }, RETRY_DELAY_MS)
        }
      }
    } finally {
      isValidatingRef.current = false
      if (mountedRef.current) {
        setIsValidating(false)
      }
    }
  }, []) // Empty dependency array - no dependencies!

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
