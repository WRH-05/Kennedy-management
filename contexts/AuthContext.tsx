"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { useSessionManager } from '@/hooks/useSessionManager'
import { LoadingManager } from '@/components/LoadingManager'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { sessionData, isValidating, refreshSession } = useSessionManager()
  const [user, setUser] = useState<User | null>(null)

  // Convert session data to user format
  useEffect(() => {
    if (sessionData?.valid && sessionData.user && sessionData.profile) {
      const formattedUser: User = {
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
      }
      setUser(formattedUser)
    } else if (sessionData && !sessionData.valid) {
      setUser(null)
    }
  }, [sessionData])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password)
      
      // Give a moment for auth state to update, then refresh our session
      await new Promise(resolve => setTimeout(resolve, 1000))
      refreshSession()
      
      return result
    } catch (error) {
      console.error('Auth error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, token: string) => {
    const result = await authService.signUp(email, password, token)
    // Don't automatically check user - they need to confirm email first
    return result
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    // Refresh session to clear state
    setTimeout(() => refreshSession(), 500)
  }

  const updateProfile = async (updates: any) => {
    const result = await authService.updateProfile(updates)
    // Refresh session to get updated profile
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
    
    const { role } = user.profile
    
    // Define access control rules
    const permissions = {
      // Owners can access everything
      owner: ['*'],
      
      // Managers can access most things except user management
      manager: [
        'students', 'teachers', 'courses', 'payments', 
        'attendance', 'revenue', 'archives'
      ],
      
      // Receptionists have limited access
      receptionist: [
        'students', 'teachers', 'courses', 'attendance'
      ]
    }

    const userPermissions = permissions[role] || []
    
    // Check if user has access to all resources or specific resource
    return userPermissions.includes('*') || userPermissions.includes(resource)
  }

  const value = {
    user,
    loading: isValidating,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    canAccess,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      <LoadingManager 
        sessionData={sessionData}
        isValidating={isValidating}
        refreshSession={refreshSession}
      >
        {children}
      </LoadingManager>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
