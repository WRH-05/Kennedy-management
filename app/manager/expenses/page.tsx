"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Receipt, Trash2, ExternalLink, Loader2 } from "lucide-react"
import { useExpenses } from "@/hooks/useExpenses"
import { AddExpenseDialog } from "@/components/tabs/AddExpenseDialog"
import { useToast } from "@/hooks/use-toast"
import { revalidateData } from "@/hooks/swr-config"
import { expenseService, ExpenseCategory } from "@/services/expenseService"

const CATEGORY_BADGES: Record<ExpenseCategory, string> = {
  supplies: "bg-blue-100 text-blue-800",
  rent: "bg-purple-100 text-purple-800",
  utilities: "bg-amber-100 text-amber-800",
  maintenance: "bg-emerald-100 text-emerald-800",
  other: "bg-gray-100 text-gray-800",
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  supplies: "Supplies",
  rent: "Rent",
  utilities: "Utilities",
  maintenance: "Maintenance",
  other: "Other",
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString()
}

export default function ExpensesPage() {
  const { toast } = useToast()
  const { expenses, isLoading } = useExpenses()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await expenseService.deleteExpense(id)
      revalidateData('all')
      toast({ title: "Expense deleted", description: "The expense has been removed." })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operational Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Track supplies, rent, utilities, maintenance and other operating costs.
          </p>
        </div>
        <AddExpenseDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            Expense Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : expenses.length > 0 ? (
            <div className="rounded-md border max-h-[70vh] overflow-auto scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="w-15"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>{formatDate(expense.expense_date)}</TableCell>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>
                        <Badge className={CATEGORY_BADGES[expense.category] || "bg-gray-100 text-gray-800"}>
                          {CATEGORY_LABELS[expense.category] || expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{expense.notes || "—"}</TableCell>
                      <TableCell>
                        {expense.proof_url ? (
                          <a
                            href={expense.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View
                          </a>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {Number(expense.amount).toLocaleString()} DA
                      </TableCell>
                      <TableCell>{expense.recorded_by_name || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700"
                          disabled={deletingId === expense.id}
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg text-gray-400">
              <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No operational expenses recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
