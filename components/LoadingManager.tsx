"use client"

import React from 'react'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoadingManagerProps {
  children: React.ReactNode
  sessionData: any
  isValidating: boolean
  refreshSession: () => void
}

export function LoadingManager({ 
  children, 
  sessionData, 
  isValidating, 
  refreshSession 
}: LoadingManagerProps) {
  
  // Show loading only for initial validation, not infinite
  if (sessionData === null && isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Handle error states
  if (sessionData?.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Session error: {sessionData.error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <Button 
              onClick={refreshSession} 
              className="w-full"
              disabled={isValidating}
            >
              {isValidating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Retry
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Handle unauthenticated state
  if (sessionData && !sessionData.authenticated) {
    // Let the app handle this through normal routing
    return <>{children}</>
  }

  // Handle profile setup needed
  if (sessionData?.needsProfileSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Setup Required</h2>
          <p className="text-gray-600 mb-4">
            Your account needs to be set up. Please contact your administrator.
          </p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  // Handle inactive profile
  if (sessionData?.profileInactive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Account Inactive</h2>
          <p className="text-gray-600 mb-4">
            Your account has been deactivated. Please contact your administrator.
          </p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  // Valid session - render app
  if (sessionData?.valid) {
    return <>{children}</>
  }

  // Fallback for unexpected states
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  )
}
