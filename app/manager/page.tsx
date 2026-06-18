"use client"
import SummaryCards from "@/components/dashboard/SummaryCards"
import Link from "next/link"
import { ArrowRight, Users, BookOpen, DollarSign, Archive, LibraryBig, Banknote  } from "lucide-react"
export default function DashboardHubPage() {
  return (
    <div className="space-y-8">
      {/* Show the global metrics at the top */}

      {/* Grid of quick navigation shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/manager/students" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /> Manage Students</h3>
            <p className="text-sm text-gray-500">View directories and status mappings</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/manager/teachers" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-500" /> Manage Teachers</h3>
            <p className="text-sm text-gray-500">Track assignments and payouts</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/manager/revenue" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-amber-500" /> Financial Logs</h3>
            <p className="text-sm text-gray-500">Review revenue collections</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/manager/courses" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><LibraryBig className="h-5 w-5 text-red-500" /> Manange Courses</h3>
            <p className="text-sm text-gray-500">Edit courses</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/manager/archive" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Archive className="h-5 w-5 text-amber-800" /> Manange Archives</h3>
            <p className="text-sm text-gray-500">Check Archives</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/manager/payouts" className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Banknote className="h-5 w-5 text-green-700" /> Manange Payouts</h3>
            <p className="text-sm text-gray-500">Time for money baby</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Rollover Confirmation Dialog */}
      <AlertDialog open={showRolloverDialog} onOpenChange={setShowRolloverDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {currentPeriod ? 'Start New Billing Period' : 'Initialize Billing Period'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {rolloverSummary && (
                  <>
                    {currentPeriod && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700">Current Period</p>
                        <p className="text-lg font-bold">{currentPeriod.period_name}</p>
                      </div>
                    )}

                    {(rolloverSummary.outstandingStudentPayments > 0 || rolloverSummary.outstandingTeacherPayouts > 0) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-800">Outstanding Items</p>
                            <p className="text-sm text-orange-700">
                              {rolloverSummary.outstandingStudentPayments} unpaid student payments and{' '}
                              {rolloverSummary.outstandingTeacherPayouts} pending teacher payouts will remain in Outstanding until resolved.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-700">New Period Preview</p>
                      <div className="mt-2 space-y-1 text-sm text-blue-900">
                        <p>{rolloverSummary.activeCourses} active courses</p>
                        <p>{rolloverSummary.enrolledStudents} enrolled students</p>
                        <p>{rolloverSummary.totalBillingRecordsToCreate} billing records will be created</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      This will create pending payment records for all enrolled students and reset attendance tracking for the new month.
                    </p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRollingOver}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartNewPeriod} disabled={isRollingOver}>
              {isRollingOver ? 'Starting...' : 'Start New Period'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}