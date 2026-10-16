"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Loader2, Receipt } from "lucide-react"
import { Tables } from "@/types/database.types"
import { studentPaymentService, EnrichedStudentPayments } from "@/services/studentPaymentService"
import { useStudentOutstandingPayments } from "@/hooks/usePayments"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/hooks/use-toast"
import { revalidateData } from "@/hooks/swr-config"
import { getCourseDisplayName } from "@/lib/course-display"
import { printStudentReceipt, StudentReceiptItem } from "@/components/dashboard/StudentPaymentReceipt"

type PayableItem =
  | { key: string; kind: "tuition"; payment: EnrichedStudentPayments; amount: number }
  | { key: string; kind: "registration"; amount: number }

interface CollectStudentPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Tables<"students"> | null | undefined
  /** Called after the writes settle so the page can reload its non-SWR state. */
  onCollected: () => void | Promise<void>
}

function money(value: number | string | null | undefined): string {
  return (Number(value) || 0).toLocaleString()
}

/**
 * Counter-mode collection: one dialog that settles every unpaid class for a student
 * (plus the registration fee when it is still owed) and prints a single combined
 * 80mm receipt.
 */
export function CollectStudentPaymentDialog({
  open,
  onOpenChange,
  student,
  onCollected,
}: CollectStudentPaymentDialogProps) {
  const { payments: outstanding, isLoading } = useStudentOutstandingPayments(student?.id)
  const { settings } = useSchoolSettings()
  const { profile } = useAuth()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const registrationFee = Number(settings?.default_registration_fee) || 500
  const needsRegistrationFee = Boolean(student) && !student?.registration_fee_paid

  const items = useMemo<PayableItem[]>(() => {
    const tuition: PayableItem[] = (outstanding || []).map((p) => ({
      key: `tuition:${p.id}`,
      kind: "tuition",
      payment: p,
      amount: Number(p.amount) || 0,
    }))
    if (needsRegistrationFee) {
      tuition.push({ key: "registration", kind: "registration", amount: registrationFee })
    }
    return tuition
  }, [outstanding, needsRegistrationFee, registrationFee])

  // Every item starts checked; the clerk unchecks what the parent is not settling today.
  // Keyed on a joined string so the effect does not re-fire on every new array identity.
  const itemKeys = items.map((item) => item.key).join("|")
  useEffect(() => {
    if (!open) return
    setSelected(new Set(itemKeys ? itemKeys.split("|") : []))
  }, [open, itemKeys])

  const selectedItems = items.filter((item) => selected.has(item.key))
  const total = selectedItems.reduce((sum, item) => sum + item.amount, 0)

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const labelFor = (item: PayableItem) =>
    item.kind === "registration" ? "Registration Fee" : getCourseDisplayName(item.payment.course_instances)

  const handleSubmit = async () => {
    if (!student || submitting || selectedItems.length === 0) return

    setSubmitting(true)
    const receiptItems: StudentReceiptItem[] = []
    const failures: string[] = []
    let receiptId: string | null = null

    try {
      // Sequential, and a failure does not abort the rest: the parent is standing at the
      // counter and may already have handed over cash for the other items.
      for (const item of selectedItems) {
        try {
          if (item.kind === "tuition") {
            const row = await studentPaymentService.payStudentPayment(item.payment.id)
            // A null row means the update matched nothing (RLS filtered it) without raising
            // an error. Never print a receipt line for a write that did not land.
            if (!row) throw new Error("Payment row was not updated")
            receiptItems.push({
              label: "Frais de Cours",
              className: getCourseDisplayName(item.payment.course_instances),
              amount: Number(row.amount) || 0,
            })
            if (!receiptId) receiptId = row.id
          } else {
            const row = await studentPaymentService.payRegistrationFee(student.id)
            if (!row) throw new Error("Registration fee row was not created")
            receiptItems.push({
              label: "Frais d'Inscription",
              amount: Number(row.amount) || 0,
            })
            if (!receiptId) receiptId = row.id
          }
        } catch (error) {
          console.error("Failed to collect payment item:", item.key, error)
          failures.push(labelFor(item))
        }
      }
    } finally {
      // Reflect reality in the UI even when part of the loop failed.
      try {
        revalidateData("all")
        await onCollected()
      } catch (error) {
        console.error("Post-collection refresh failed:", error)
      }
      setSubmitting(false)
    }

    if (failures.length > 0) {
      toast({
        title: "Some payments could not be recorded",
        description: `Failed: ${failures.join(", ")}.`,
        variant: "destructive",
      })
    }

    if (receiptItems.length === 0) return

    printStudentReceipt(
      {
        receiptId: receiptId || `${student.id}-${Date.now()}`,
        studentName: student.name,
        parentPhone: student.parent_phone ?? null,
        items: receiptItems,
        recordedByName: profile?.full_name || "-",
        paymentDate: new Date().toISOString(),
      },
      settings
    )

    toast({
      title: "Payment collected",
      description: `${receiptItems.length} item${receiptItems.length > 1 ? "s" : ""} recorded.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Collect Tuition
          </DialogTitle>
          <DialogDescription>
            {student?.name ? `Outstanding fees for ${student.name}.` : "Outstanding fees."} Uncheck anything
            the parent is not paying today.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-1 overflow-y-auto">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading outstanding fees...
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing outstanding for this student.
            </p>
          ) : (
            items.map((item) => {
              const isRegistration = item.kind === "registration"
              const cycle = !isRegistration ? item.payment.billing_periods : null
              return (
                // A plain div rather than a <label>: Radix renders the checkbox as a
                // <button>, and label activation forwarding to a button is unreliable
                // (it can also double-fire). The row toggles on click; the checkbox keeps
                // the keyboard path and stops the click from bubbling back into the row.
                <div
                  key={item.key}
                  onClick={() => !submitting && toggle(item.key)}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selected.has(item.key)}
                      onCheckedChange={() => toggle(item.key)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={submitting}
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {isRegistration
                          ? "Registration Fee"
                          : getCourseDisplayName(item.payment.course_instances)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isRegistration
                          ? "One-time registration fee"
                          : cycle?.start_date && cycle?.end_date
                            ? `${cycle.start_date} → ${cycle.end_date}`
                            : "Billing cycle unavailable"}
                      </p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold">{money(item.amount)} DA</span>
                </div>
              )
            })
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-medium">Total to Collect:</span>
          <span className="text-xl font-bold">{money(total)} DA</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || selectedItems.length === 0}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Payment & Print Receipt"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
