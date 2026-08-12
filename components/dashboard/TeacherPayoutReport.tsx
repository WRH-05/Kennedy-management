"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { CourseInstanceDetail } from "@/services/courseInstancesService"
import { CourseInstanceWithEnrichment } from "@/services/courseInstancesService"
import { useStudentsData } from "@/hooks/usePayments"
import { SchoolSettings } from "@/services/schoolSettingsService"
import { Tables } from "@/types/database.types"

interface TeacherPayoutReportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseInstance: CourseInstanceDetail
  courseInstanceEnriched: CourseInstanceWithEnrichment
  selectedPeriodId: string
  billingPeriods: Tables<"billing_periods">[]
  teacherEarnings: number
  schoolSettings: SchoolSettings | null
}

export function TeacherPayoutReport({
  open,
  onOpenChange,
  courseInstance,
  courseInstanceEnriched: _courseInstanceEnriched,
  selectedPeriodId,
  billingPeriods,
  teacherEarnings,
  schoolSettings,
}: TeacherPayoutReportProps) {
  const { payments } = useStudentsData(selectedPeriodId)

  const activePeriod = useMemo(() =>
    billingPeriods.find((bp) => bp.id === selectedPeriodId),
    [billingPeriods, selectedPeriodId]
  )

  // Single source of truth: derive counts from the payments array
  const enrolledStudents = payments || []
  const totalEnrolled = enrolledStudents.length
  const totalPaid = enrolledStudents.filter((s) => s.status === 'paid').length

  const compType = (courseInstance as any).compensation_type || 'percentage'
  const courseTitle = courseInstance.course_eligibility?.courses?.name || courseInstance.display_name || "Course"
  const gradeLevel = courseInstance.course_eligibility?.grade_levels?.name
  const displayName = courseInstance.display_name
  const teacherName = courseInstance.teachers?.name || "N/A"
  const reportDate = new Date().toLocaleDateString()

  const compLabel = compType === 'fixed_salary'
    ? `Fixed Salary: ${((courseInstance as any).fixed_salary_amount || 0).toLocaleString()} DA`
    : `Revenue Share: ${(courseInstance as any).percentage_cut || 0}%`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teacher Payout Report Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of the teacher payout report. Use the Print Report button to generate the A4 document.
          </DialogDescription>
        </DialogHeader>

        {/* On-screen preview — hidden when printing */}
        <div className="no-print p-6" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* School Header */}
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center gap-4 mb-2">
              <img
                src={schoolSettings?.logo_url || "/home.png"}
                alt="School Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/home.png' }}
              />
              <div>
                <h1 className="text-xl font-bold">{schoolSettings?.school_name || "Kennedy Management System"}</h1>
                {schoolSettings?.address && (
                  <p className="text-sm text-gray-600">{schoolSettings.address}</p>
                )}
                {schoolSettings?.phone && (
                  <p className="text-sm text-gray-600">{schoolSettings.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Course Details</h2>
            <table className="w-full text-sm mt-1">
              <tbody>
                <tr>
                  <td className="font-medium w-32 py-0.5">Course:</td>
                  <td>{courseTitle}{gradeLevel ? ` — ${gradeLevel}` : ""}</td>
                </tr>
                {displayName && (
                  <tr>
                    <td className="font-medium py-0.5">Display Name:</td>
                    <td>{displayName}</td>
                  </tr>
                )}
                <tr>
                  <td className="font-medium py-0.5">Teacher:</td>
                  <td>{teacherName}</td>
                </tr>
                <tr>
                  <td className="font-medium py-0.5">Billing Period:</td>
                  <td>{activePeriod ? `${activePeriod.start_date} → ${activePeriod.end_date}` : "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Enrolled Students Table */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Enrolled Students</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-1.5 pr-2">Student Name</th>
                  <th className="text-left py-1.5 pr-2">Parent Phone</th>
                  <th className="text-left py-1.5">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">No students enrolled for this period.</td>
                  </tr>
                ) : (
                  enrolledStudents.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-1.5 pr-2">{p.students?.name || "Unknown"}</td>
                      <td className="py-1.5 pr-2">{p.students?.parent_phone || p.students?.phone || "N/A"}</td>
                      <td className="py-1.5">
                        <span className={
                          p.status === 'paid' ? 'text-green-600 font-medium' :
                          p.status === 'cancelled' ? 'text-red-500' :
                          'text-amber-500'
                        }>
                          {p.status === 'paid' ? 'Paid' :
                           p.status === 'cancelled' ? 'Cancelled' :
                           p.status === 'pending' ? 'Pending' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Collections Summary */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Collections Summary</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5">Total Enrolled Students:</td>
                  <td className="py-1.5 font-medium text-right">{totalEnrolled}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5">Total Paid Students:</td>
                  <td className="py-1.5 font-medium text-right">{totalPaid}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5">Compensation Model:</td>
                  <td className="py-1.5 font-medium text-right">{compLabel}</td>
                </tr>
                <tr>
                  <td className="py-2 text-base font-bold">Final Teacher Payout:</td>
                  <td className="py-2 text-base font-bold text-right text-green-600">
                    {teacherEarnings.toLocaleString()} DA
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Single print action in footer */}
        <DialogFooter className="no-print">
          <Button variant="default" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print Report
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Dedicated A4 printable document — hidden on screen, visible only when printing */}
      {open && (
        <div id="printable-payout-report" className="hidden print:block">
          {/* Letterhead */}
          <div style={{ borderBottom: '3px solid #1e293b', paddingBottom: '12px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img
              src={schoolSettings?.logo_url || "/home.png"}
              alt="School Logo"
              style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/home.png' }}
            />
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{schoolSettings?.school_name || "Kennedy Management System"}</h1>
              {schoolSettings?.address && <p style={{ margin: '2px 0', fontSize: '13px' }}>{schoolSettings.address}</p>}
              {schoolSettings?.phone && <p style={{ margin: '2px 0', fontSize: '13px' }}>Tel: {schoolSettings.phone}</p>}
              <p style={{ margin: '2px 0', fontSize: '13px', fontWeight: 600 }}>Teacher Payout Report</p>
              <p style={{ margin: '2px 0', fontSize: '13px' }}>Date: {reportDate}</p>
            </div>
          </div>

          {/* Course info */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '20px' }}>
            <tbody>
              <tr><td style={{ fontWeight: 600, padding: '4px 0', width: '180px' }}>Subject / Course:</td><td>{courseTitle}{gradeLevel ? ` — ${gradeLevel}` : ""}</td></tr>
              {displayName && (<tr><td style={{ fontWeight: 600, padding: '4px 0' }}>Display Name:</td><td>{displayName}</td></tr>)}
              <tr><td style={{ fontWeight: 600, padding: '4px 0' }}>Teacher:</td><td>{teacherName}</td></tr>
              <tr><td style={{ fontWeight: 600, padding: '4px 0' }}>Billing Period:</td><td>{activePeriod ? `${activePeriod.start_date} → ${activePeriod.end_date}` : "N/A"}</td></tr>
              <tr><td style={{ fontWeight: 600, padding: '4px 0' }}>Compensation Model:</td><td>{compLabel}</td></tr>
            </tbody>
          </table>

          {/* Enrolled students */}
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Enrolled Students</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e293b' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Student Name</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Parent Phone</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolledStudents.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '12px 8px', textAlign: 'center' }}>No students enrolled for this period.</td></tr>
              ) : (
                enrolledStudents.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 8px' }}>{idx + 1}</td>
                    <td style={{ padding: '6px 8px' }}>{p.students?.name || "Unknown"}</td>
                    <td style={{ padding: '6px 8px' }}>{p.students?.parent_phone || p.students?.phone || "N/A"}</td>
                    <td style={{ padding: '6px 8px' }}>
                      {p.status === 'paid' ? 'Paid' : p.status === 'cancelled' ? 'Cancelled' : p.status === 'pending' ? 'Pending' : 'Unpaid'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Financial summary */}
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Financial Summary</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '24px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '6px 0' }}>Total Enrolled Students</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>{totalEnrolled}</td></tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '6px 0' }}>Total Paid Students</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>{totalPaid}</td></tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '6px 0' }}>Net Amount (Teacher Payout)</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700 }}>{teacherEarnings.toLocaleString()} DA</td></tr>
            </tbody>
          </table>

          {/* Signature block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '48px', marginTop: '48px', fontSize: '14px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}><div style={{ borderTop: '1px solid #1e293b', paddingTop: '8px' }}>Teacher Signature</div></div>
            <div style={{ textAlign: 'center', flex: 1 }}><div style={{ borderTop: '1px solid #1e293b', paddingTop: '8px' }}>Director Stamp / Signature</div></div>
          </div>
        </div>
      )}
    </Dialog>
  )
}
