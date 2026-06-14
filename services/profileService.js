import { supabase } from '@/lib/supabase'

export const profileService = {
    async getCurrentUserProfile() {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return null

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            // include school_id when available so services can scope queries
            .select('id, full_name, role, school_id')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.warn('No profile found for user:', user.id)
            return null
        }

        return profile
    }
}