import { supabase } from '@/lib/supabase'

// Enable debug logging in development
const DEBUG_SESSION = process.env.NODE_ENV === 'development'

export async function validateSession() {
  try {
    if (DEBUG_SESSION) console.log('🔍 Calling supabase.rpc("get_current_user_session")...')
    
    // Use the new database function instead of built-in session validation
    const { data, error } = await supabase.rpc('get_current_user_session')
    
    if (error) {
      console.error('❌ Session validation error:', error)
      return { 
        valid: false, 
        authenticated: false,
        user: null, 
        profile: null, 
        school: null,
        error: error.message 
      }
    }

    if (DEBUG_SESSION) console.log('📊 Raw session data from database:', data)

    const result = {
      valid: data?.session_valid || false,
      authenticated: data?.authenticated || false,
      user: data?.user || null,
      profile: data?.profile || null,
      school: data?.school || null,
      permissions: data?.permissions || null,
      needsProfileSetup: data?.needs_profile_setup || false,
      profileInactive: data?.profile_inactive || false,
      error: data?.error || null
    }

    if (DEBUG_SESSION) console.log('✅ Processed session result:', result)
    return result
    
  } catch (error: any) {
    console.error('💥 Session validation failed:', error)
    return { 
      valid: false, 
      authenticated: false,
      user: null, 
      profile: null, 
      school: null,
      error: error.message 
    }
  }
}
