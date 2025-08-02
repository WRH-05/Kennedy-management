"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallbackPath?: string
}

export default function AuthGuard({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/auth/login' 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackPath)
        return
      }

      // Check role requirements
      if (requiredRoles.length > 0 && user.profile?.role) {
        if (!requiredRoles.includes(user.profile.role)) {
          // Redirect based on user role
          switch (user.profile.role) {
            case 'owner':
            case 'manager':
              router.push('/manager')
              break
            case 'receptionist':
              router.push('/receptionist')
              break
            default:
              router.push(fallbackPath)
          }
          return
        }
      }

      // Auto-redirect authenticated users from auth pages
      if (user && ['/auth/login', '/auth/signup', '/auth/create-school'].includes(window.location.pathname)) {
        switch (user.profile?.role) {
          case 'owner':
          case 'manager':
            router.push('/manager')
            break
          case 'receptionist':
            router.push('/receptionist')
            break
          default:
            router.push('/manager')
        }
      }
    }
  }, [user, loading, router, requiredRoles, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (requiredRoles.length > 0 && (!user.profile?.role || !requiredRoles.includes(user.profile.role))) {
    return null // Will redirect to appropriate dashboard
  }

  return <>{children}</>
}
