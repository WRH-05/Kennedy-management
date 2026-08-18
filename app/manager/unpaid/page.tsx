"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Loader2, Wallet, Receipt, CreditCard, ExternalLink, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useUnpaid } from "@/hooks/useUnpaid"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"
import { useToast } from "@/hooks/use-toast"
import { revalidateData } from "@/hooks/swr-config"
import { studentPaymentService } from "@/services/studentPaymentService"
import { getCourseDisplayName } from "@/lib/course-display"

type TabKey = "tuition" | "registration" | "payouts"

const TABS: { key: TabKey; label: string }[] = [
  { key: "tuition", label: "Unpaid Tuition" },
  { key: "registration", label: "Unpaid Registration Fees" },
  { key: "payouts", label: "Pending Teacher Payouts" },
]

function StatCard({ title, icon: Icon, value }: { title: string; icon: LucideIcon; value: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()} DA</div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg text-gray-400">
      <Icon className="h-10 w-10 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString()
}

function billingCycle(start?: string | null, end?: string | null): string {
  if (!start && !end) return "—"
  return `${start || "?"} → ${end || "?"}`
}

export default function UnpaidPage() {
  const { toast } = useToast()
  const { data, isLoading, mutate } = useUnpaid()
  const { settings } = useSchoolSettings()
  const [tab, setTab] = useState<TabKey>("tuition")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const unpaidTuition = data?.unpaidTuition || []
  const unpaidRegistration = data?.unpaidRegistration || []
  const pendingPayouts = data?.pendingPayouts || []

  const registrationFee = settings?.default_registration_fee ?? 500

  const totalUnpaidTuition = unpaidTuition.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const totalUnpaidRegistration = unpaidRegistration.length * registrationFee
  const totalPendingPayouts = pendingPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const handleRecordPayment = async (paymentId: string) => {
    if (processingId) return
    setProcessingId(paymentId)
    try {
      await studentPaymentService.payStudentPayment(paymentId)
      await mutate()
      revalidateData('all')
      toast({ title: "Payment recorded", description: "The tuition payment has been marked as paid." })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handlePayRegistrationFee = async (studentId: string) => {
    if (processingId) return
    setProcessingId(studentId)
    try {
      await studentPaymentService.payRegistrationFee(studentId)
      await mutate()
      revalidateData('all')
      toast({ title: "Registration fee paid", description: "The student's registration fee has been recorded." })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pay registration fee: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Revenue Leakage & Debt</h1>
        <p className="text-sm text-muted-foreground">
          Track unpaid student tuition, unpaid registration fees, and pending teacher payouts.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Unpaid Student Tuition" icon={Receipt} value={totalUnpaidTuition} />
            <StatCard title="Total Unpaid Registration Fees" icon={CreditCard} value={totalUnpaidRegistration} />
            <StatCard title="Total Pending Teacher Payouts" icon={Wallet} value={totalPendingPayouts} />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border p-1 w-fit">
            {TABS.map((t) => (
              <Button
                key={t.key}
                size="sm"
                variant={tab === t.key ? "default" : "ghost"}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {tab === "tuition" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  Unpaid Tuition
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unpaidTuition.length > 0 ? (
                  <div className="rounded-md border max-h-[65vh] overflow-auto scrollbar-thin">
                    <Table>
                      <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Billing Cycle</TableHead>
                          <TableHead>Amount Due</TableHead>
                          <TableHead className="w-40">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpaidTuition.map((p) => (
                          <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{p.students?.name || "—"}</TableCell>
                            <TableCell>{getCourseDisplayName(p.course_instances)}</TableCell>
                            <TableCell>{billingCycle(p.billing_periods?.start_date, p.billing_periods?.end_date)}</TableCell>
                            <TableCell className="font-semibold text-primary">{Number(p.amount).toLocaleString()} DA</TableCell>
                            <TableCell>
                              <Button size="sm" disabled={processingId === p.id} onClick={() => handleRecordPayment(p.id)}>
                                Record Payment
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState icon={Receipt} text="No unpaid tuition." />
                )}
              </CardContent>
            </Card>
          )}

          {tab === "registration" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Unpaid Registration Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unpaidRegistration.length > 0 ? (
                  <div className="rounded-md border max-h-[65vh] overflow-auto scrollbar-thin">
                    <Table>
                      <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>Registration Fee</TableHead>
                          <TableHead className="w-40">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpaidRegistration.map((s) => (
                          <TableRow key={s.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell>{s.phone || "—"}</TableCell>
                            <TableCell>{formatDate(s.created_at)}</TableCell>
                            <TableCell className="font-semibold text-primary">{registrationFee.toLocaleString()} DA</TableCell>
                            <TableCell>
                              <Button size="sm" disabled={processingId === s.id} onClick={() => handlePayRegistrationFee(s.id)}>
                                Pay Registration Fee
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState icon={CreditCard} text="All students have paid their registration fee." />
                )}
              </CardContent>
            </Card>
          )}

          {tab === "payouts" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  Pending Teacher Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPayouts.length > 0 ? (
                  <div className="rounded-md border max-h-[65vh] overflow-auto scrollbar-thin">
                    <Table>
                      <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                        <TableRow>
                          <TableHead>Teacher Name</TableHead>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Billing Cycle</TableHead>
                          <TableHead>Payout Amount</TableHead>
                          <TableHead className="w-40">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingPayouts.map((p) => (
                          <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{p.teachers?.name || "—"}</TableCell>
                            <TableCell>{getCourseDisplayName(p.course_instances)}</TableCell>
                            <TableCell>{billingCycle(p.billing_periods?.start_date, p.billing_periods?.end_date)}</TableCell>
                            <TableCell className="font-semibold text-primary">{Number(p.amount).toLocaleString()} DA</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/manager/payouts">
                                  <ExternalLink className="h-4 w-4 mr-2" /> View Payouts
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState icon={Wallet} text="No pending teacher payouts." />
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
