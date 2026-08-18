"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { revalidateData } from "@/hooks/swr-config"
import { expenseService, ExpenseCategory } from "@/services/expenseService"

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "supplies", label: "Supplies" },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
]

export function AddExpenseDialog() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<ExpenseCategory>("supplies")
  const [amount, setAmount] = useState("")
  const [expenseDate, setExpenseDate] = useState("")
  const [notes, setNotes] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProofFile(e.target.files?.[0] || null)
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!title.trim()) {
      toast({ title: "Missing title", description: "Please enter an expense title.", variant: "destructive" })
      return
    }
    const amountNum = Number.parseFloat(amount) || 0
    if (amountNum <= 0) {
      toast({ title: "Invalid amount", description: "Please enter an amount greater than zero.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await expenseService.addExpense({
        title: title.trim(),
        category,
        amount: amountNum,
        expense_date: expenseDate || new Date().toISOString().slice(0, 10),
        notes: notes.trim() || undefined,
        proof_file: proofFile,
      })
      revalidateData('all')

      setTitle("")
      setCategory("supplies")
      setAmount("")
      setExpenseDate("")
      setNotes("")
      setProofFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setIsOpen(false)

      toast({ title: "Expense added", description: `${title.trim()} has been recorded.` })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Operational Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Classroom supplies"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (DA)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Receipt Proof (JPG/PNG/PDF)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> {proofFile ? proofFile.name : "Choose File"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
