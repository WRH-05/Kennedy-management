import { useEffect, useCallback, useState, useRef } from 'react'
import { validateSession, SessionResult, clearSessionCache } from '@/utils/supabase-session'
import { supabase } from '@/lib/supabase'

const DEBOUNCE_MS = 5000 // Increased from 3s to 5s
const FOCUS_DEBOUNCE_MS = 60000 // Increased from 30s to 60s
const RETRY_DELAY_MS = 2000 // Retry delay on failure
const MAX_RETRIES = 2 // Max retry attempts

export function useSessionManager() {
  const [isValidating, setIsValidating] = useState(true)
  const [sessionData, setSessionData] = useState<SessionResult | null>(null)
  const lastValidationRef = useRef<number>(0)
  const isValidatingRef = useRef<boolean>(false)
  const mountedRef = useRef<boolean>(true)
  const retryCountRef = useRef<number>(0)
  
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
    
    // Only show loading on initial load, not on refreshes
    if (sessionData === null) {
      setIsValidating(true)
    }
    
    try {
      const session = await validateSession(force)
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        // If we got a valid session or explicit not-authenticated, reset retry count
        if (session.valid || !session.authenticated) {
          retryCountRef.current = 0
        }
        
        // Only set error if we have no valid cached session and exhausted retries
        if (session.error && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++
          // Schedule a retry
          setTimeout(() => {
            if (mountedRef.current) {
              refreshSession(true)
            }
          }, RETRY_DELAY_MS)
          return // Don't update state with error yet
        }
        
        setSessionData(session)
      }
    } catch (error) {
      if (mountedRef.current && retryCountRef.current >= MAX_RETRIES) {
        setSessionData({
          valid: false,
          authenticated: false,
          user: null,
          profile: null,
          school: null,
          permissions: null,
          error: error instanceof Error ? error.message : 'Session validation failed'
        })
      } else if (mountedRef.current) {
        retryCountRef.current++
        // Schedule a retry
        setTimeout(() => {
          if (mountedRef.current) {
            refreshSession(true)
          }
        }, RETRY_DELAY_MS)
      }
    } finally {
      isValidatingRef.current = false
      if (mountedRef.current) {
        setIsValidating(false)
      }
    }
  }, [sessionData])

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
