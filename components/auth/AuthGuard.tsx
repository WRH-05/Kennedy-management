"use client"

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname()

  // 1. If auth is still loading, show the spinner immediately
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // 2. RUN CHECKS DIRECTLY IN THE RENDER PHASE (No useEffect needed!)
  
  // Unauthenticated
  if (!user) {
    router.push(fallbackPath)
    return null 
  }

  // Email confirmation check
  if (user.needsEmailConfirmation) {
    router.push(`/auth/check-email?email=${encodeURIComponent(user.email || '')}`)
    return null
  }

  const userRole = user.profile?.role

  // Role authorization check
  if (requiredRoles.length > 0) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      if (userRole === 'manager') router.push('/manager')
      else if (userRole === 'receptionist') router.push('/receptionist')
      else router.push('/unauthorized')
      return null
    }
  }

  // Prevent authenticated users from staying on auth pages
  const authPages = ['/auth/login', '/auth/signup', '/auth/create-school']
  if (authPages.includes(pathname)) {
    if (userRole === 'manager') router.push('/manager')
    else if (userRole === 'receptionist') router.push('/receptionist')
    else router.push('/')
    return null
  }

  // 3. If all guards pass, safely render the application
  return <>{children}</>
} 