// components/billing-period-toolbar.tsx
import { useState } from "react"
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { paymentService } from "@/services/paymentService"
import { useToast } from "@/hooks/use-toast"
import { Tables } from "@/types/database.types"

interface BillingPeriodToolbarProps {
  courseInstanceId: string
  billingPeriods: Tables<"billing_periods">[]
  selectedPeriodId: string
  setSelectedPeriodId: (id: string) => void
  cycleStatuses?: Record<string, 'red' | 'orange' | 'green'>
  onRefresh: () => void
  readOnly?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-amber-400',
  green: 'bg-green-500',
}

export function BillingPeriodToolbar({ courseInstanceId, billingPeriods, selectedPeriodId, setSelectedPeriodId, cycleStatuses, onRefresh, readOnly = false }: BillingPeriodToolbarProps) {
  const { toast } = useToast()
  const [showAddBillingDialog, setShowAddBillingDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newBillingForm, setNewBillingForm] = useState({ startDate: "", endDate: "" })

  // Navigate between billing periods (ordered newest-first by start_date DESC)
  // 'prev' = chronologically previous (older) = higher index in array
  // 'next' = chronologically next (newer) = lower index in array
  const stepBillingPeriod = (direction: 'next' | 'prev') => {
    const currentIndex = billingPeriods.findIndex(p => p.id === selectedPeriodId)
    if (direction === 'next' && currentIndex > 0) {
      setSelectedPeriodId(billingPeriods[currentIndex - 1].id)
    } else if (direction === 'prev' && currentIndex < billingPeriods.length - 1) {
      setSelectedPeriodId(billingPeriods[currentIndex + 1].id)
    }
  }

  const handleAddBillingPeriod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBillingForm.startDate || !newBillingForm.endDate) return
    if (isSubmitting) return

    // Validate: end date must be after start date
    if (newBillingForm.endDate <= newBillingForm.startDate) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive",
      })
      return
    }

    // Validate: start date must be >= the most recent previous period's end date
    if (billingPeriods.length > 0) {
      const lastPeriod = billingPeriods[0] // newest first
      if (newBillingForm.startDate < lastPeriod.end_date) {
        toast({
          title: "Overlapping Periods",
          description: `Start date must be on or after the previous billing period's end date (${lastPeriod.end_date}).`,
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      const freshPeriod = await paymentService.createBillingPeriod(courseInstanceId, newBillingForm.startDate, newBillingForm.endDate)
      toast({ title: "Success", description: "New billing cycle defined." })
      setSelectedPeriodId(freshPeriod.id)
      setNewBillingForm({ startDate: "", endDate: "" })
      setShowAddBillingDialog(false)
      onRefresh()
    } catch(e) {
      console.error(e)
      toast({ title: "Error", description: "Failed to create cycle.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-gray-500" />
        <span className="font-semibold text-sm">Billing Cycle:</span>
        {billingPeriods.length > 0 ? (
          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
            <SelectTrigger className="min-w-[250px] h-9"><SelectValue placeholder="Select Cycle" /></SelectTrigger>
            <SelectContent>
              {billingPeriods.map((p) => {
                const status = cycleStatuses?.[p.id] || 'orange'
                return (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[status] || 'bg-gray-400'}`} />
                      {p.start_date} → {p.end_date}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-xs text-muted-foreground">No defined periods</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-md h-9 overflow-hidden bg-gray-50">
          <Button variant="ghost" size="icon" className="h-full rounded-none border-r" onClick={() => stepBillingPeriod('prev')} disabled={billingPeriods.findIndex(p => p.id === selectedPeriodId) >= billingPeriods.length - 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-full rounded-none" onClick={() => stepBillingPeriod('next')} disabled={billingPeriods.findIndex(p => p.id === selectedPeriodId) <= 0}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={showAddBillingDialog} onOpenChange={setShowAddBillingDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9" disabled={readOnly}><Plus className="h-4 w-4 mr-1" /> Cycle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Billing Period</DialogTitle></DialogHeader>
            <form onSubmit={handleAddBillingPeriod} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="bStart">Start Date</Label>
                <Input id="bStart" type="date" value={newBillingForm.startDate} onChange={(e) => setNewBillingForm({ ...newBillingForm, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bEnd">End Date</Label>
                <Input id="bEnd" type="date" value={newBillingForm.endDate} onChange={(e) => setNewBillingForm({ ...newBillingForm, endDate: e.target.value })} required />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddBillingDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Period"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}