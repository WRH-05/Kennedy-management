"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, School } from 'lucide-react'
import { authService } from '@/services/authService'

export default function CreateSchoolForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [schoolData, setSchoolData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  })
  
  const [userData, setUserData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!schoolData.name.trim()) {
      setError('School name is required')
      return
    }
    
    setStep(2)
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (userData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      const result = await authService.createSchoolAndOwner(schoolData, userData, userData.password)
      
      // Store user data in localStorage for immediate access
      if (result.user) {
        const userData = {
          id: result.user.id,
          email: result.user.email,
          role: 'owner',
          school_id: result.school.id,
          school_name: result.school.name
        }
        localStorage.setItem('user', JSON.stringify(userData))
      }
      
      router.push('/manager') // Redirect to manager dashboard
    } catch (err: any) {
      console.error('School creation error:', err)
      setError(err.message || 'Failed to create school. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchoolData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <School className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Kennedy Management</h1>
          <p className="mt-2 text-gray-600">Create Your School Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? 'School Information' : 'Owner Account'}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Enter your school details to get started'
                : 'Create your owner account to manage the school'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {step === 1 ? (
              <form onSubmit={handleSchoolSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={schoolData.name}
                    onChange={handleSchoolChange}
                    required
                    placeholder="Enter school name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={schoolData.address}
                    onChange={handleSchoolChange}
                    placeholder="Enter school address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={schoolData.phone}
                    onChange={handleSchoolChange}
                    placeholder="Enter school phone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={schoolData.email}
                    onChange={handleSchoolChange}
                    placeholder="Enter school email"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={userData.full_name}
                    onChange={handleUserChange}
                    required
                    disabled={loading}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleUserChange}
                    required
                    disabled={loading}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleUserChange}
                    disabled={loading}
                    placeholder="Enter your phone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={userData.password}
                    onChange={handleUserChange}
                    required
                    disabled={loading}
                    placeholder="Create a password (min 6 characters)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={userData.confirmPassword}
                    onChange={handleUserChange}
                    required
                    disabled={loading}
                    placeholder="Confirm your password"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create School
                  </Button>
                </div>
              </form>
            )}
            
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
