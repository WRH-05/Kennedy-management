import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/types/database.types";

const supabase = createClient();

export const profileService = {
    async getCurrentUserProfile(): Promise<Tables<"profiles">> {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) throw Error("No user found")

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            .throwOnError()

        return profile
    }
}