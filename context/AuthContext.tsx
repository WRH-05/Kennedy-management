// context/AuthContext.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { jwtDecode } from "jwt-decode"
import { type User } from "@supabase/supabase-js"

// 1. Properly allow null for the initial/logged-out state
type UserWithRole = User & { user_role: string }

interface AuthContextType {
  user: UserWithRole | null
  loading: boolean
}

const supabase = createClient()

// Give your context a real type instead of 'any'
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to attach custom JWT claims to the user object
  const getSessionUserWithRole = (session: any): UserWithRole | null => {
    if (!session?.user) return null
    const jwt: Record<string, any> = jwtDecode(session.access_token)
    return {
      ...session.user,
      user_role: jwt?.app_metadata.user_role, // fallback role if needed
    }
  }


  useEffect(() => {
    // 2. Fetch initial session (contains both user and access_token)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(getSessionUserWithRole(session))
      setLoading(false)
    })

    // 3. Listen for auth updates (login, logout, token refreshes)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(getSessionUserWithRole(session))
      setLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook with a helpful error check if used outside the provider
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}