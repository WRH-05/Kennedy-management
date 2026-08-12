import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

export interface SchoolSettings {
  id: string
  school_name: string | null
  address: string | null
  phone: string | null
  logo_url: string | null
  default_registration_fee: number | null
  created_at: string | null
  updated_at: string | null
}

// Helper: cast the supabase client to accept our custom table name
const db = supabase as any

let cachedId: string | null = null

async function getRowId(): Promise<string | null> {
  if (cachedId) return cachedId
  const { data } = await db
    .from('school_settings')
    .select('id')
    .limit(1)
    .maybeSingle()
  cachedId = (data as any)?.id || null
  return cachedId
}

export const schoolSettingsService = {
  async getSettings(): Promise<SchoolSettings> {
    const { data } = await db
      .from('school_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (data?.id) cachedId = data.id

    // Return safe defaults when the table is empty so SWR never reports an error
    if (!data) {
      const now = new Date().toISOString()
      return {
        id: 'default',
        school_name: 'Kennedy Management System',
        address: '',
        phone: '',
        logo_url: '/home.png',
        default_registration_fee: 500,
        created_at: now,
        updated_at: now,
      }
    }

    return data as SchoolSettings
  },

  async updateSettings(updates: Partial<SchoolSettings>): Promise<SchoolSettings> {
    const id = await getRowId()

    // No settings row exists yet — create one instead of crashing
    if (!id) {
      const { data } = await db
        .from('school_settings')
        .insert({ ...updates, updated_at: new Date().toISOString() })
        .select()
        .single()
        .throwOnError()

      if (data?.id) cachedId = data.id
      return data as SchoolSettings
    }

    const { data } = await db
      .from('school_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
      .throwOnError()

    return data as SchoolSettings
  },

  async uploadLogo(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `logo-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  },
}
