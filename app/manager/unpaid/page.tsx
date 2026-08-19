"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Wallet, Receipt, CreditCard, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useUnpaid } from "@/hooks/useUnpaid"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"
import { getCourseDisplayName } from "@/lib/course-display"

type TabKey = "tuition" | "registration" | "payouts"

const TABS: { key: TabKey; label: string }[] = [
  { key: "tuition", label: "Unpaid Tuition" },
  { key: "registration", label: "Unpaid Registration Fees" },
  { key: "payouts", label: "Unrequested Teacher Payouts" },
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
  const { data, isLoading } = useUnpaid()
  const { settings } = useSchoolSettings()
  const [tab, setTab] = useState<TabKey>("tuition")

  const unpaidTuition = data?.unpaidTuition || []
  const unpaidRegistration = data?.unpaidRegistration || []
  const unrequestedPayouts = data?.unrequestedPayouts || []

  const registrationFee = settings?.default_registration_fee ?? 500

  const totalUnpaidTuition = unpaidTuition.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const totalUnpaidRegistration = unpaidRegistration.length * registrationFee
  const totalUnrequestedPayouts = unrequestedPayouts.reduce((sum, p) => sum + (Number(p.calculated_earnings) || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Revenue Leakage & Debt</h1>
        <p className="text-sm text-muted-foreground">
          Track unpaid student tuition, unpaid registration fees, and unrequested teacher payouts.
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
            <StatCard title="Total Unrequested Teacher Payouts" icon={Wallet} value={totalUnrequestedPayouts} />
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpaidTuition.map((p) => (
                          <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">
                              <Link href={`/student/${p.student_id}`} className="hover:underline">
                                {p.students?.name || "—"}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/course-instance/${p.course_instances?.id}?cycle=${p.billing_period_id}`}
                                className="hover:underline"
                              >
                                {getCourseDisplayName(p.course_instances)}
                              </Link>
                            </TableCell>
                            <TableCell>{billingCycle(p.billing_periods?.start_date, p.billing_periods?.end_date)}</TableCell>
                            <TableCell className="font-semibold text-primary">{Number(p.amount).toLocaleString()} DA</TableCell>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpaidRegistration.map((s) => (
                          <TableRow key={s.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">
                              <Link href={`/student/${s.id}`} className="hover:underline">
                                {s.name}
                              </Link>
                            </TableCell>
                            <TableCell>{s.phone || "—"}</TableCell>
                            <TableCell>{formatDate(s.created_at)}</TableCell>
                            <TableCell className="font-semibold text-primary">{registrationFee.toLocaleString()} DA</TableCell>
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
                  Unrequested Teacher Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unrequestedPayouts.length > 0 ? (
                  <div className="rounded-md border max-h-[65vh] overflow-auto scrollbar-thin">
                    <Table>
                      <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                        <TableRow>
                          <TableHead>Teacher Name</TableHead>
                          <TableHead>Class Instance Name</TableHead>
                          <TableHead>Billing Cycle</TableHead>
                          <TableHead>Unrequested Earnings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unrequestedPayouts.map((p) => (
                          <TableRow key={p.billing_period_id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">
                              <Link href={`/teacher/${p.teacher_id}`} className="hover:underline">
                                {p.teacher_name}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/course-instance/${p.course_id}?cycle=${p.billing_period_id}`}
                                className="hover:underline"
                              >
                                {p.class_name}
                              </Link>
                            </TableCell>
                            <TableCell>{billingCycle(p.start_date, p.end_date)}</TableCell>
                            <TableCell className="font-semibold text-primary">{p.calculated_earnings.toLocaleString()} DA</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState icon={Wallet} text="No unrequested teacher payouts." />
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
