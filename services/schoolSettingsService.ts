import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

export interface SchoolSettings {
  id: string
  school_name: string | null
  address: string | null
  phone: string | null
  logo_url: string | null
  previous_logo_urls: string[] | null
  default_registration_fee: number | null
  created_at: string | null
  updated_at: string | null
}

// Helper: cast the supabase client to accept our custom table name
const db = supabase as any

// Extract the storage object path (after "/logos/") from a public logo URL.
function extractLogoPath(url: string): string | null {
  const idx = url.indexOf('/logos/')
  return idx === -1 ? null : url.slice(idx + '/logos/'.length)
}

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
        previous_logo_urls: [],
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

  async uploadLogo(file: File): Promise<SchoolSettings> {
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

    const newLogoUrl = urlData.publicUrl
    const current = await this.getSettings()

    // Prepend the current logo to the history (newest first), skipping the placeholder.
    const prev = current.logo_url && current.logo_url !== '/home.png'
      ? [current.logo_url, ...(current.previous_logo_urls || []).filter(u => u !== current.logo_url)]
      : (current.previous_logo_urls || [])

    // Cap the history at 3 entries; evict the oldest (4th) file from storage.
    let evictedUrl: string | null = null
    let next = prev
    if (next.length > 3) {
      evictedUrl = next[next.length - 1]
      next = next.slice(0, 3)
    }

    const updated = await this.updateSettings({ logo_url: newLogoUrl, previous_logo_urls: next })

    if (evictedUrl) {
      const path = extractLogoPath(evictedUrl)
      if (path) await supabase.storage.from('logos').remove([path])
    }

    return updated
  },

  async selectPreviousLogo(selectedUrl: string): Promise<SchoolSettings> {
    const current = await this.getSettings()

    // Promote the selected URL to active and move the former logo into the history.
    const rest = (current.previous_logo_urls || []).filter(u => u !== selectedUrl)
    const prev = current.logo_url && current.logo_url !== '/home.png'
      ? [current.logo_url, ...rest]
      : rest

    return this.updateSettings({ logo_url: selectedUrl, previous_logo_urls: prev })
  },
}
