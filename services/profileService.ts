import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/types/database.types"

export const profileService = {
  async getCurrentUserProfile(): Promise<Tables<"profiles">> {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) console.error(authError)
    if (authError || !user) throw new Error("No user found")

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .throwOnError()

    return profile as Tables<"profiles">
  }
}