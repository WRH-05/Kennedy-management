"use client"

import { useMemo } from "react"
import { createPortal } from "react-dom"
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

  const handlePrint = () => {
    const originalTitle = document.title
    const teacherNameSafe = (courseInstance.teachers?.name || 'Enseignant').replace(/[^a-zA-Z0-9]/g, '_')
    const period = activePeriod ? `${activePeriod.start_date}_${activePeriod.end_date}` : 'Period'
    document.title = `Rapport_Paiement_${teacherNameSafe}_${period}`
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

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
          <Button variant="default" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print Report
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Dedicated A4 printable document — hidden on screen, visible only when printing */}
      {open && createPortal(
        <div id="printable-payout-report" className="hidden print:block p-10">
          {/* Letterhead — two-column header with accent line */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img
                src={schoolSettings?.logo_url || "/home.png"}
                alt="School Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/home.png' }}
              />
              <div>
                <h1 className="text-xl font-bold uppercase leading-tight">{schoolSettings?.school_name || "Kennedy Management System"}</h1>
                {schoolSettings?.address && <p className="text-sm text-slate-600">{schoolSettings.address}</p>}
                {schoolSettings?.phone && <p className="text-sm text-slate-600">Tel: {schoolSettings.phone}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold uppercase tracking-wide">Teacher Payout Report</h2>
              <p className="text-sm text-slate-600">Date: {reportDate}</p>
            </div>
          </div>

          {/* Course details box */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-md mb-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><span className="font-semibold">Course Name:</span> {courseTitle}{gradeLevel ? ` — ${gradeLevel}` : ""}</div>
              {displayName && <div><span className="font-semibold">Display Name:</span> {displayName}</div>}
              <div><span className="font-semibold">Teacher:</span> {teacherName}</div>
              <div><span className="font-semibold">Billing Period:</span> {activePeriod ? `${activePeriod.start_date} → ${activePeriod.end_date}` : "N/A"}</div>
              <div><span className="font-semibold">Compensation Model:</span> {compLabel}</div>
            </div>
          </div>

          {/* Enrolled students table */}
          <h2 className="text-base font-bold mb-2">Enrolled Students</h2>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="text-left p-2 font-semibold">#</th>
                <th className="text-left p-2 font-semibold">Student Name</th>
                <th className="text-left p-2 font-semibold">Parent Phone</th>
                <th className="text-left p-2 font-semibold">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-500">No students enrolled for this period.</td>
                </tr>
              ) : (
                enrolledStudents.map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{p.students?.name || "Unknown"}</td>
                    <td className="p-2">{p.students?.parent_phone || p.students?.phone || "N/A"}</td>
                    <td className="p-2">
                      {p.status === 'paid' ? (
                        <span className="text-green-600 font-medium">Paid</span>
                      ) : p.status === 'cancelled' ? (
                        <span className="text-red-500">Cancelled</span>
                      ) : (
                        <span className="text-amber-500">{p.status === 'pending' ? 'Pending' : 'Unpaid'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Financial summary — counts left, net payout callout right */}
          <h2 className="text-base font-bold mb-2">Financial Summary</h2>
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span>Total Enrolled Students</span>
                <span className="font-semibold">{totalEnrolled}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span>Total Paid Students</span>
                <span className="font-semibold">{totalPaid}</span>
              </div>
            </div>
            <div className="bg-slate-100 border border-slate-300 p-4 rounded-md text-right">
              <p className="text-xs uppercase font-semibold text-slate-500 mb-1">Net Amount (Teacher Payout)</p>
              <p className="text-2xl font-bold text-slate-900">{teacherEarnings.toLocaleString()} DA</p>
            </div>
          </div>

          {/* Signature block */}
          <div className="flex justify-between gap-12 mt-16 pt-6 border-t border-slate-200">
            <div className="flex-1 text-center text-sm">
              <div className="border-t border-slate-900 pt-2">Teacher Signature</div>
            </div>
            <div className="flex-1 text-center text-sm">
              <div className="border-t border-slate-900 pt-2">Director Stamp / Signature</div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Dialog>
  )
}
