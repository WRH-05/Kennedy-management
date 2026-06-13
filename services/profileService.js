import { supabase } from '@/lib/supabase'

export const profileService = {
    async getCurrentUserProfile() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) return null

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.warn('No profile found for user:', user.id)
                return null
            }

            return profile
        } catch (error) {
            console.error('Error getting user profile:', error)
            return null
        }
    }
}