// SIMPLIFIED AUTH SERVICE - Replace getCurrentUser function
// Copy this function and replace the getCurrentUser method in authService.js

// Simplified getCurrentUser without timeout complexity
async getCurrentUser() {
  try {
    console.log('🔍 Getting current user...');
    
    // Step 1: Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Auth error:', userError)
      return null
    }
    
    if (!user) {
      console.log('👤 No authenticated user found')
      return null
    }

    console.log('✅ User found:', user.id, 'Email confirmed:', !!user.email_confirmed_at)

    // Step 2: Check email confirmation status
    if (!user.email_confirmed_at) {
      console.log('📧 User email not confirmed yet')
      return {
        ...user,
        profile: null,
        needsEmailConfirmation: true
      }
    }

    // Step 3: Get user profile - SIMPLIFIED without timeout
    console.log('🔍 Fetching profile for user:', user.id)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        schools (
          id,
          name,
          address,
          phone,
          email,
          logo_url
        )
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.warn('⚠️ Profile not found:', profileError.message)
      // Return user without profile instead of failing
      return {
        ...user,
        profile: null
      }
    }

    if (!profile) {
      console.warn('⚠️ No profile data returned')
      return {
        ...user,
        profile: null
      }
    }

    console.log('✅ Profile found:', profile.id, 'School:', profile.school_id, 'Role:', profile.role)
    return {
      ...user,
      profile
    }
  } catch (error) {
    console.error('💥 Unexpected error in getCurrentUser:', error)
    return null
  }
}
