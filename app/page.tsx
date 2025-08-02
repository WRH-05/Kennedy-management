"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user && user.profile) {
        // Redirect authenticated users with profiles to their dashboard
        switch (user.profile?.role) {
          case 'owner':
          case 'manager':
            router.push('/manager')
            break
          case 'receptionist':
            router.push('/receptionist')
            break
          default:
            router.push('/auth/login')
        }
      } else {
        // Redirect unauthenticated users or users without profiles to login
        router.push('/auth/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Kennedy Management System...</p>
        </div>
      </div>
    )
  }

  return null // Will redirect
}
