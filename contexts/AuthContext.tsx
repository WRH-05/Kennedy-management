"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { useSessionManager } from '@/hooks/useSessionManager'
import { SessionResult, clearSessionCache } from '@/utils/supabase-session'

interface User {
  id: string
  email?: string
  needsEmailConfirmation?: boolean
  profile: {
    id: string
    school_id: string
    role: 'owner' | 'manager' | 'receptionist'
    full_name: string
    phone?: string
    avatar_url?: string
    schools: {
      id: string
      name: string
      address?: string
      phone?: string
      email?: string
      logo_url?: string
    }
  } | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, token: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
  hasRole: (roles: string | string[]) => boolean
  canAccess: (resource: string) => boolean
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Permission map for role-based access
const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'],
  manager: ['students', 'teachers', 'courses', 'payments', 'attendance', 'revenue', 'archives'],
  receptionist: ['students', 'teachers', 'courses', 'attendance']
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { sessionData, isValidating, refreshSession } = useSessionManager()
  const [user, setUser] = useState<User | null>(null)

  // Convert session data to user format
  useEffect(() => {
    if (sessionData?.valid && sessionData.user && sessionData.profile) {
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
          avatar_url: sessionData.profile.avatar_url,
          schools: sessionData.school
        }
      })
    } else if (sessionData && !sessionData.valid) {
      setUser(null)
    }
  }, [sessionData])

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    // Wait briefly for auth state to update, then refresh
    await new Promise(resolve => setTimeout(resolve, 500))
    refreshSession()
    return result
  }

  const signUp = async (email: string, password: string, token: string) => {
    return await authService.signUp(email, password, token)
  }

  const signOut = async () => {
    try {
      // Clear user state immediately for responsive UI
      setUser(null)
      
      // Clear session cache
      clearSessionCache()
      
      // Sign out from Supabase
      await authService.signOut()
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
  }

  const updateProfile = async (updates: any) => {
    const result = await authService.updateProfile(updates)
    refreshSession()
    return result
  }

  const hasRole = (roles: string | string[]): boolean => {
    if (!user?.profile?.role) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.profile.role)
  }

  const canAccess = (resource: string): boolean => {
    if (!user?.profile?.role) return false
    const permissions = ROLE_PERMISSIONS[user.profile.role] || []
    return permissions.includes('*') || permissions.includes(resource)
  }

  // Simplified loading state - only show loading on initial load
  const isLoading = isValidating && sessionData === null

  return (
    <AuthContext.Provider value={{
      user,
      loading: isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      hasRole,
      canAccess,
      refreshSession
    }}>
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

  // Normal rendering
  return <>{children}</>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
