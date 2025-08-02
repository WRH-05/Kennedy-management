"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/authService'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        await checkUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    try {
      setLoading(true)
      
      // Add timeout to prevent infinite loading (increased from 10s to 15s)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Authentication check timeout')), 15000)
      )
      
      const currentUser = await Promise.race([
        authService.getCurrentUser(),
        timeoutPromise
      ])
      
      setUser(currentUser as User | null)
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    await checkUser()
    return result
  }

  const signUp = async (email: string, password: string, token: string) => {
    const result = await authService.signUp(email, password, token)
    await checkUser()
    return result
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const updateProfile = async (updates: any) => {
    const result = await authService.updateProfile(updates)
    await checkUser()
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
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    canAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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
