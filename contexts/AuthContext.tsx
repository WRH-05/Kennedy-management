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
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...')
        
        // First check if there's an existing session
        const session = await authService.getCurrentSession()
        console.log('📊 Current session:', session ? 'exists' : 'none')
        
        if (session && session.user) {
          // Session exists, get user with profile
          await checkUser()
        } else {
          // No session, user is not authenticated
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
        }
        
        if (mounted) {
          setInitialized(true)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    // Initialize auth on mount
    initializeAuth()

    // Listen for auth changes with improved handling
    const { data: { subscription } } = authService.onAuthStateChange(async (event: any, session: any) => {
      if (!mounted) return
      
      console.log('🔄 Auth state change:', event, session ? 'session exists' : 'no session')
      
      try {
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ User signed in, fetching profile...')
          await checkUser()
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('👋 User signed out or session lost')
          setUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed, updating user data...')
          await checkUser()
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
        setUser(null)
        setLoading(false)
      }
    })

    // Handle page visibility changes to refresh auth state
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && initialized) {
        console.log('👁️ Page became visible, checking auth state...')
        // Small delay to allow any pending auth operations to complete
        setTimeout(() => {
          if (mounted) {
            initializeAuth()
          }
        }, 500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mounted = false
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function checkUser() {
    try {
      setLoading(true)
      
      // First verify we have a valid session
      const session = await authService.getCurrentSession()
      if (!session || !session.user) {
        console.log('🚫 No valid session found')
        setUser(null)
        return
      }
      
      console.log('✅ Valid session found, getting user profile...')
      
      // Get current user with profile
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser as User | null)
      
      console.log('Auth check completed:', { 
        hasUser: !!currentUser, 
        hasProfile: !!currentUser?.profile,
        userId: currentUser?.id,
        email: currentUser?.email 
      })
    } catch (error) {
      console.error('Error checking user:', error)
      
      // If there's an auth error, clear the user state
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('Auth session missing') || 
          errorMessage.includes('JWT expired') ||
          errorMessage.includes('Invalid token')) {
        console.log('🔄 Session expired or invalid, clearing user state')
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password)
      
      // Give a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await checkUser()
      return result
    } catch (error) {
      console.error('❌ Auth error:', error)
      
      // Even if signIn throws an error, check if user is actually authenticated
      try {
        const currentUser = await authService.getCurrentUser()
        if (currentUser && currentUser.profile) {
          console.log('✅ Login successful despite error - user is authenticated')
          setUser(currentUser as User | null)
          return { user: currentUser }
        }
      } catch (checkError) {
        console.error('Error checking user after failed signin:', checkError)
      }
      
      throw error
    }
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
