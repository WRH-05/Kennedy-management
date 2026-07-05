"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function DashboardNavTabs() {
  const pathname = usePathname()
  const { hasRole } = useAuth()

  const tabs = [
    { name: "Revenue", href: "/dashboard/revenue" },
    { name: "Payouts", href: "/dashboard/payouts" },
    { name: "Students", href: "/dashboard/students" },
    { name: "Teachers", href: "/dashboard/teachers" },
    { name: "Courses", href: "/dashboard/courses" },
    { name: "Archive", href: "/dashboard/archive" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="w-full p-1 rounded-lg grid grid-cols-7 gap-1 max-w-7xl mx-auto bg-gray-200/80">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md transition-all text-center ${
            isActive(tab.href)
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          }`}
        >
          {tab.name}
        </Link>
      ))}
      
      {hasRole(['owner', 'manager']) && (
        <Link
          href="/dashboard/users"
          className={`flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md transition-all text-center ${
            isActive("/dashboard/users")
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          }`}
        >
          <Settings className="h-4 w-4 mr-2" />
          Users
        </Link>
      )}
    </div>
  )
}