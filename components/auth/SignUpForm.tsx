"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'

export default function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useAuth()
  
  const token = searchParams.get('token')
  const inviteEmail = searchParams.get('email')
  
  const [formData, setFormData] = useState({
    email: inviteEmail || '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<any>(null)
  const [verifyingInvite, setVerifyingInvite] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState(true)

  React.useEffect(() => {
    if (token && inviteEmail) {
      verifyInvitation()
    }
  }, [token, inviteEmail])

  const verifyInvitation = async () => {
    if (!token || !inviteEmail) {
      setError('Invalid invitation link')
      return
    }

    setVerifyingInvite(true)
    try {
      const invite = await authService.verifyInvitation(token, inviteEmail)
      if (!invite) {
        setError('Invalid or expired invitation')
        return
      }
      setInvitation(invite)
    } catch (err: any) {
      setError(err.message || 'Failed to verify invitation')
    } finally {
      setVerifyingInvite(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Missing invitation token')
      return
    }

    setLoading(true)
    try {
      await signUp(formData.email, formData.password, token)
      // Redirect to check email page after successful signup
      router.push(`/auth/check-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Real-time password confirmation check for better UX
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const password = name === 'password' ? value : formData.password
      const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword
      setPasswordMatch(password === confirmPassword)
    }
  }

  if (verifyingInvite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying invitation...</p>
        </div>
      </div>
    )
  }

  if (!invitation && !verifyingInvite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This invitation link is invalid or has expired.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Kennedy Management</h1>
          <p className="mt-2 text-gray-600">Complete Your Registration</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              You've been invited to join {invitation?.schools?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitation && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You're being invited as a <strong>{invitation.role}</strong> by{' '}
                  <strong>{invitation.invited_by_profile?.full_name}</strong>
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading || !!inviteEmail}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={loading}
                  placeholder="Create a password (min 6 characters)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Confirm your password"
                  className={!passwordMatch && formData.confirmPassword ? 'border-red-500' : ''}
                />
                {!passwordMatch && formData.confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={loading || !passwordMatch}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
