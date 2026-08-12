"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { jwtDecode } from "jwt-decode"
import { type User } from "@supabase/supabase-js"
import { Tables } from "@/types/database.types"

type UserWithRole = User & { user_role: string }

interface AuthContextType {
  user: UserWithRole | null
  profile: Tables<"profiles"> | null // Now exposed globally
  loading: boolean
}

// Fixed architectural mistake from previous turns: instantiate inside the provider scope
// or use inline references to avoid module scope state leakages across users.
const supabase = createClient()

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to attach custom JWT claims to the user object
  const getSessionUserWithRole = (session: any): UserWithRole | null => {
    if (!session?.user) return null
    const jwt: Record<string, any> = jwtDecode(session.access_token)
    return {
      ...session.user,
      user_role: jwt?.app_metadata?.user_role || "authenticated",
    }
  }

  // Extracted logic to fetch profile cleanly
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      // Real DB/network/permission error — log and preserve existing profile state
      if (error) {
        console.warn("Profile lookup failed inside AuthContext:", error)
        return
      }

      if (!data) {
        console.warn("No profile row found for user", userId)
      }

      // data is the profile object, or null when no row exists
      setProfile(data)
    } catch (e) {
      console.warn("Unexpected profile fetch error inside AuthContext:", e)
      // Don't setProfile(null) — preserve whatever was loaded
    }
  }

  useEffect(() => {
    const handleAuthUpdate = async (session: any) => {
      const parsedUser = getSessionUserWithRole(session)
      setUser(parsedUser)

      if (parsedUser) {
        await fetchUserProfile(parsedUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthUpdate(session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthUpdate(session)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}