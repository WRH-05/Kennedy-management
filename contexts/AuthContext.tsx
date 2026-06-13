"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { authService } from '@/services/authService'
import { useSessionManager } from '@/hooks/useSessionManager'
import { SessionResult, clearSessionCache } from '@/utils/supabase-session'


interface Profile {
  id: string
  school_id: string
  role: 'owner' | 'manager' | 'receptionist'
  full_name: string
  phone?: string
  avatar_url?: string
}

interface User {
  id: string
  email?: string
  needsEmailConfirmation?: boolean
  profile: Profile
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<unknown>
  signUp: (email: string, password: string, token: string, fullName?: string, phone?: string) => Promise<unknown>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<unknown>
  hasRole: (roles: string | string[]) => boolean
  canAccess: (resource: string) => boolean
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'],
  manager: ['students', 'teachers', 'courses', 'payments', 'attendance', 'revenue', 'archives'],
  receptionist: ['students', 'teachers', 'courses', 'attendance']
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { sessionData, isValidating, refreshSession } = useSessionManager()
  const [user, setUser] = useState<User | null>(null)
  // Use structural primitive values to safely decide when to update user state
  const sessionUserId = sessionData?.user?.id
  const sessionProfileId = sessionData?.profile?.id
  const isValid = sessionData?.valid

  useEffect(() => {
    if (isValid && sessionData?.user && sessionData?.profile) {
      setUser({
        id: sessionData.user.id,
        email: sessionData.user.email,
        needsEmailConfirmation: !sessionData.user.email_confirmed_at,
        profile: {
          id: sessionData.profile.id,
          school_id: sessionData.profile.school_id,
          role: sessionData.profile.role,
          full_name: sessionData.profile.full_name,
          phone: sessionData.profile.phone,
          avatar_url: sessionData.profile.avatar_url
        }
      })
    } else if (sessionData && !isValid) {
      setUser(null)
    }
  // Runs only if the explicit user data or validation status pivots
  }, [sessionUserId, sessionProfileId, isValid, sessionData])

  const signIn = useCallback(async (email: string, password: string) => {
    // Ensure any internal exceptions bubbles up to the form's catch block
    const result = await authService.signIn(email, password)
    
    // Smooth transition allowance for hooks to capture session data
    await new Promise(resolve => setTimeout(resolve, 250))
    await refreshSession()
    
    return result
  }, [refreshSession])

  const signUp = useCallback(async (email: string, password: string, token: string, fullName?: string, phone?: string) => {
    return await authService.signUp(email, password, token, fullName, phone)
  }, [])

  const signOut = useCallback(async () => {
    try {
      setUser(null)
      clearSessionCache()
      await authService.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    const result = await authService.updateProfile(updates)
    refreshSession()
    return result
  }, [refreshSession])

  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user?.profile?.role) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.profile.role)
  }, [user?.profile?.role])

  const canAccess = useCallback((resource: string): boolean => {
    if (!user?.profile?.role) return false
    const permissions = ROLE_PERMISSIONS[user.profile.role] || []
    return permissions.includes('*') || permissions.includes(resource)
  }, [user?.profile?.role])

  const isLoading = isValidating && sessionData === null

  // Memoize the value object so children aren't forced to re-render 
  // on unrelated component refreshes
  const contextValue = useMemo(() => ({
    user,
    loading: isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    canAccess,
    refreshSession
  }), [user, isLoading, signIn, signUp, signOut, updateProfile, hasRole, canAccess, refreshSession])

  return (
    <AuthContext.Provider value={contextValue}>
      {renderContent(sessionData, isLoading, refreshSession, children)}
    </AuthContext.Provider>
  )
}

// Render content based on session state
function renderContent(
  sessionData: SessionResult | null, 
  isLoading: boolean,
  refreshSession: () => void,
  children: React.ReactNode
) {
  // Initial loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Only show error if we have a critical error AND no valid session data
  // Timeout errors should be silently retried, not shown to user
  if (sessionData?.error && !sessionData.valid && !sessionData.authenticated) {
    // Skip showing timeout errors - just render children and let it retry
    if (sessionData.error.includes('timed out')) {
      return <>{children}</>
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <p className="text-red-600 mb-4">Session error: {sessionData.error}</p>
          <button 
            onClick={() => refreshSession()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Profile setup needed
  if (sessionData?.needsProfileSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Setup Required</h2>
          <p className="text-gray-600 mb-4">
            Your account needs to be set up. Please contact your administrator.
          </p>
          <a href="/auth/login" className="text-primary hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  // Inactive profile
  if (sessionData?.profileInactive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Account Inactive</h2>
          <p className="text-gray-600 mb-4">
            Your account has been deactivated. Please contact your administrator.
          </p>
          <a href="/auth/login" className="text-primary hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
