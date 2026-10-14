import { createClient } from "@/lib/supabase/client"
import { activityLogService } from "@/services/activityLogService"

const supabase = createClient()

// Helper: cast the supabase client to accept our custom table name (not in generated types)
const db = supabase as any

export type ExpenseCategory = "supplies" | "rent" | "utilities" | "maintenance" | "other"

export interface Expense {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  expense_date: string
  notes: string | null
  proof_url: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
  recorded_by_name?: string | null
}

export interface AddExpenseInput {
  title: string
  category: ExpenseCategory
  amount: number
  expense_date: string
  notes?: string
  proof_file?: File | null
}

async function uploadReceiptProof(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `receipt-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('expense_receipts')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('expense_receipts')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

export const expenseService = {
  async addExpense({ title, category, amount, expense_date, notes, proof_file }: AddExpenseInput): Promise<Expense> {
    let proof_url: string | null = null
    if (proof_file) {
      proof_url = await uploadReceiptProof(proof_file)
    }

    const { data: { user } } = await supabase.auth.getUser()
    const recorded_by = user?.id ?? null

    const { data, error } = await db
      .from('school_expenses')
      .insert([{
        title,
        category,
        amount,
        expense_date,
        notes: notes || null,
        proof_url,
        recorded_by,
      }])
      .select()
      .single()

    if (error) throw error

    await activityLogService.logActivity({
      action_type: 'expense_added',
      title: `Expense Added: ${title}`,
      amount,
      entity_type: 'expense',
      entity_id: data.id,
    })

    return data as Expense
  },

  async getExpenses(category?: string, range?: string, query?: string): Promise<Expense[]> {
    let q = db
      .from('school_expenses')
      .select('*, profiles!school_expenses_recorded_by_fkey(full_name)')
      .order('expense_date', { ascending: false })

    if (category && category !== 'all') {
      q = q.eq('category', category)
    }

    if (range === 'last30') {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      q = q.gte('expense_date', cutoff)
    } else if (range === 'thisMonth') {
      const now = new Date()
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      q = q.gte('expense_date', start)
    }

    if (query && query.trim()) {
      q = q.ilike('title', `%${query.trim()}%`)
    }

    const { data, error } = await q
    if (error) throw error

    return ((data || []) as any[]).map((row) => ({
      ...row,
      recorded_by_name: row.profiles?.full_name ?? '-',
    }))
  },

  async deleteExpense(id: string): Promise<void> {
    const { data: existing } = await db
      .from('school_expenses')
      .select('title, amount')
      .eq('id', id)
      .maybeSingle()

    const { error } = await db.from('school_expenses').delete().eq('id', id)
    if (error) throw error

    await activityLogService.logActivity({
      action_type: 'expense_deleted',
      title: `Expense Deleted: ${existing?.title ?? 'Unknown'}`,
      amount: Number(existing?.amount) || 0,
      entity_type: 'expense',
      entity_id: id,
    })
  },
}
