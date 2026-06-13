"use client"
import SummaryCards from "@/components/dashboard/SummaryCards"
import Link from "next/link"
import { ArrowRight, Users, BookOpen, DollarSign } from "lucide-react"

export default function DashboardHubPage() {
  return (
    <div className="space-y-8">
      {/* Show the global metrics at the top */}
      <SummaryCards />

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
      </div>
    </div>
  )
}