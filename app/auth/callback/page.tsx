"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { clearSessionCache } from '@/utils/supabase-session'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        // Also check for hash fragment parameters (some OAuth providers use this)
        let hashParams: URLSearchParams | null = null
        if (typeof window !== 'undefined' && window.location.hash) {
          hashParams = new URLSearchParams(window.location.hash.substring(1))
        }

        const effectiveCode = code || hashParams?.get('code')
        const effectiveTokenHash = token_hash || hashParams?.get('token_hash')
        const effectiveType = type || hashParams?.get('type')

        if (effectiveCode) {
          // Handle OAuth callback
          const { data, error } = await supabase.auth.exchangeCodeForSession(effectiveCode)
          if (error) {
            console.error('Auth callback error:', error)
            router.push('/auth/login?error=auth_callback_failed')
            return
          }
          
          // Clear session cache and wait for session to establish
          clearSessionCache()
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Redirect to home page (will redirect to appropriate dashboard)
          console.log('OAuth authentication successful')
          router.push('/')
        } else if (effectiveTokenHash && effectiveType) {
          // Handle email confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: effectiveTokenHash,
            type: effectiveType as any
          })

          if (error) {
            console.error('Email confirmation error:', error)
            router.push('/auth/confirm?error=confirmation_failed')
            return
          }

          // Clear session cache so fresh profile data is fetched
          clearSessionCache()
          
          // Wait for session to be fully established
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Get user to determine redirect
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            // Fetch profile to determine role
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userData.user.id)
              .single()
            
            if (profile?.role) {
              // Redirect based on role
              const redirectPath = profile.role === 'receptionist' ? '/receptionist' : '/manager'
              console.log('Email confirmation successful, redirecting to:', redirectPath)
              router.push(redirectPath)
              return
            }
          }
          
          // Fallback to home page
          console.log('Email confirmation successful')
          router.push('/')
        } else {
          // No valid parameters, redirect to login
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}
