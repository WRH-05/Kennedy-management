import { supabase } from '@/lib/supabase'

export const profileService = {
    async getCurrentUserProfile() {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return null

        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', user.id)
            .single()
            .throwOnError()

        return profile
    }
}