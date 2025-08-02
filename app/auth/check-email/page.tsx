'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CheckEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')

  const resendConfirmation = async () => {
    if (!email) return

    setIsResending(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        setMessage('Failed to resend confirmation email. Please try again.')
      } else {
        setMessage('Confirmation email sent! Please check your inbox.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We've sent you a confirmation email
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <Mail className="h-16 w-16 text-blue-500 mx-auto" />
          
          <div className="space-y-2">
            <p className="text-gray-600">
              We've sent a confirmation email to:
            </p>
            <p className="font-semibold text-gray-900">
              {email}
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to confirm your account and complete the registration process.
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('sent') || message.includes('Confirmation')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={resendConfirmation}
              disabled={isResending || !email}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend confirmation email'
              )}
            </Button>

            <Button
              onClick={() => router.push('/auth/login')}
              variant="ghost"
              className="w-full"
            >
              Back to login
            </Button>
          </div>

          <div className="text-xs text-gray-400">
            <p>Didn't receive the email? Check your spam folder or contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
