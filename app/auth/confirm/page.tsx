"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Mail, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('waiting')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const error = searchParams.get('error')

      // Handle error cases first
      if (error) {
        setStatus('error')
        setMessage('Email confirmation failed. Please try again.')
        return
      }

      if (token_hash && type) {
        setStatus('loading')
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          })

          if (error) {
            setStatus('error')
            setMessage(error.message)
          } else {
            setStatus('success')
            setMessage('Email confirmed successfully! You can now sign in.')
            // Redirect to home page after 3 seconds (will redirect to appropriate dashboard)
            setTimeout(() => {
              router.push('/')
            }, 3000)
          }
        } catch (error: any) {
          setStatus('error')
          setMessage(error.message || 'An error occurred during confirmation')
        }
      } else {
        // Check if user is already signed in but just needs confirmation
        const checkCurrentUser = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && user.email_confirmed_at) {
              // User is already confirmed, redirect to home
              router.push('/')
            }
          } catch (err) {
            // Ignore errors here
          }
        }
        checkCurrentUser()
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  const resendConfirmation = async () => {
    const email = searchParams.get('email')
    if (email) {
      try {
        await supabase.auth.resend({
          type: 'signup',
          email: email
        })
        setMessage('Confirmation email sent! Please check your inbox.')
      } catch (error: any) {
        setMessage('Failed to resend confirmation email.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Confirmation</CardTitle>
          <CardDescription>
            {status === 'waiting' && 'Please check your email and click the confirmation link'}
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Email confirmed successfully!'}
            {status === 'error' && 'Confirmation failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'waiting' && (
            <>
              <Mail className="h-16 w-16 text-blue-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-gray-600">
                  We've sent a confirmation email to your address.
                </p>
                <p className="text-sm text-gray-500">
                  Click the link in the email to activate your account and complete the registration process.
                </p>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  onClick={resendConfirmation}
                  className="w-full"
                >
                  Resend Confirmation Email
                </Button>
              </div>
            </>
          )}

          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-500 mx-auto animate-spin" />
              <p className="text-gray-600">
                Confirming your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-green-600 font-medium">
                  {message}
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-red-600">
                  {message}
                </p>
                <p className="text-sm text-gray-500">
                  The confirmation link may be expired or invalid.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={resendConfirmation}
                  variant="outline"
                  className="w-full"
                >
                  Resend Confirmation Email
                </Button>
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-400">
              Kennedy Management System
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
