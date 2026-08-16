import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

// Helper: cast the supabase client to accept our custom table name
const db = supabase as any

export interface ActivityLog {
  id: string
  action_type: string
  title: string
  description: string | null
  amount: number | null
  entity_type: string | null
  entity_id: string | null
  actor_id: string | null
  created_at: string
  actor_name?: string | null
}

export interface ActivityLogEntry {
  action_type: string
  title: string
  description?: string
  amount?: number
  entity_type?: string
  entity_id?: string
  actor_id?: string
}

export const activityLogService = {
  async logActivity(entry: ActivityLogEntry): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const actor_id = entry.actor_id ?? user?.id ?? null
      await db
        .from('activity_logs')
        .insert({ ...entry, actor_id })
        .throwOnError()
    } catch (error) {
      // Never let audit-log failures break the underlying operation.
      if (process.env.NODE_ENV === 'development') {
        console.warn('activityLogService.logActivity failed:', error)
      }
    }
  },

  async getLogs(filterCategory: string, dateRange: string, searchQuery: string): Promise<ActivityLog[]> {
    // Silently prune logs older than 180 days to keep DB size under control.
    const cutoffDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    db.from('activity_logs').delete().lt('created_at', cutoffDate).then(() => {}).catch(() => {})

    let query = db
      .from('activity_logs')
      .select('*, profiles!activity_logs_actor_id_fkey(full_name)')
      .order('created_at', { ascending: false })

    const categoryActions: Record<string, string[]> = {
      payments: ['payment', 'payout', 'payout_request', 'payout_confirmed'],
      payouts: ['payout', 'payout_request', 'payout_confirmed'],
      registrations: ['student_registration', 'teacher_registration'],
      archives: ['archive_request', 'archive_approved', 'archive_rejected', 'unarchive'],
      deletions: ['permanent_delete', 'course_delete', 'grade_level_delete'],
    }

    if (categoryActions[filterCategory]) {
      query = query.in('action_type', categoryActions[filterCategory])
    }

    if (dateRange === 'last30') {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', cutoff)
    } else if (dateRange === 'thisMonth') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      query = query.gte('created_at', startOfMonth)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim()
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return ((data || []) as any[]).map((row) => ({
      ...row,
      actor_name: row.profiles?.full_name ?? '-',
    }))
  },
}
