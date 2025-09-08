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
  const { signIn, user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Watch for authentication changes and redirect
  useEffect(() => {
    console.log('LoginForm useEffect - User state:', { 
      hasUser: !!user, 
      hasProfile: !!user?.profile, 
      role: user?.profile?.role, 
      loading 
    })
    
    if (user?.profile?.role) {
      console.log('User authenticated, redirecting based on role:', user.profile.role)
      // Set loading to false and redirect
      setLoading(false)
      
      switch (user.profile.role) {
        case 'owner':
        case 'manager':
          console.log('Redirecting to /manager')
          router.push('/manager')
          break
        case 'receptionist':
          console.log('Redirecting to /receptionist')
          router.push('/receptionist')
          break
        default:
          console.log('Unknown role, redirecting to home')
          router.push('/')
      }
    } else if (user && !user.profile) {
      console.log('⚠️ User found but no profile - checking if email is confirmed')
      if (user.needsEmailConfirmation) {
        console.log('📧 User needs email confirmation, redirecting to check-email')
        setLoading(false)
        router.push('/auth/check-email')
      } else {
        console.log('User verified but no profile loaded yet - waiting for profile creation')
        // Don't redirect immediately, give time for profile to load
        // setLoading(false)
        // router.push('/auth/confirm')
      }
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn(formData.email, formData.password)
      console.log('Sign in completed:', result)
      
      // Add extra time for auth state to propagate
      console.log('⏳ Waiting for auth state to update...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check if we got a user back
      if (result?.user || result?.session?.user) {
        console.log('👤 User confirmed in result, should redirect soon')
      } else {
        console.log('⚠️ No user in result, auth context should handle it')
      }
      
      // Don't set loading to false here - let the redirect handle it
    } catch (err: any) {
      console.error('Login failed:', err)
      setError(err.message || 'Failed to sign in')
      setLoading(false) // Only set loading to false on error
    }
    // Note: Don't set loading to false on success - let the redirect handle it
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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
                  disabled={loading}
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
                  disabled={loading}
                  placeholder="Enter your password"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push('/auth/create-school')}
                >
                  Create a school
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
