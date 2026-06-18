"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const router = useRouter()
  const { signIn, user, loading } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle routing reactively as soon as the AuthContext updates its user state
  useEffect(() => {
    if (user?.profile?.role) {
      switch (user.profile.role) {
        case 'manager':
          router.push('/manager')
          break
        case 'receptionist':
          router.push('/receptionist')
          break
        default:
          router.push('/')
      }
    } else if (user && !user.profile) {
      if (user.needsEmailConfirmation) {
        router.push('/auth/check-email')
      } else {
        setError('Account is verified, but no profile was found.')
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Just await the sign in process; let AuthProvider do the session syncing
      await signIn(formData.email, formData.password)
    } catch (err: any) {
      console.error('Login failed:', err)
      setError(err.message || 'Failed to sign in')
      setSubmitting(false) 
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const isFormDisabled = submitting || loading

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Kennedy Management</h1>
          <p className="mt-2 text-gray-600">School Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your school's management system
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isFormDisabled}>
                {isFormDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}