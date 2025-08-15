"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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

        if (code) {
          // Handle OAuth callback
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Auth callback error:', error)
            router.push('/auth/login?error=auth_callback_failed')
            return
          }
          
          // Redirect to home page (will redirect to appropriate dashboard)
          console.log('OAuth authentication successful')
          router.push('/')
        } else if (token_hash && type) {
          // Handle email confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          })

          if (error) {
            console.error('Email confirmation error:', error)
            router.push('/auth/confirm?error=confirmation_failed')
            return
          }

          // Redirect to home page after successful confirmation
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
