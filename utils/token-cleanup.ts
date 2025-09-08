// Token cleanup utility for development
// Use this to clear corrupted Supabase tokens

export const tokenCleanup = {
  // Clear all Supabase-related localStorage items
  clearSupabaseTokens() {
    if (typeof window === 'undefined') return
    
    const keys = Object.keys(localStorage)
    const supabaseKeys = keys.filter(key => 
      key.startsWith('supabase.auth.token') || 
      key.includes('supabase')
    )
    
    console.log('🧹 Clearing Supabase tokens:', supabaseKeys)
    
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    console.log('✅ Supabase tokens cleared. Please refresh the page.')
  },

  // Clear all storage and reload page
  fullReset() {
    if (typeof window === 'undefined') return
    
    console.log('🔄 Performing full storage reset...')
    localStorage.clear()
    sessionStorage.clear()
    
    console.log('✅ Storage cleared. Reloading page...')
    window.location.reload()
  }
}

// Make available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).tokenCleanup = tokenCleanup
}
