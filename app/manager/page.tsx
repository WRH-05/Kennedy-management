"use client"

import Link from "next/link"
import { ArrowRight, Users, Archive, ReceiptCent, GraduationCap, Layers, Briefcase, TrendingUp, CalendarDays } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// 1. Define all navigation options centrally (Outside the component to prevent re-creation on every render)
const ALL_NAVIGATION_CARDS = [
  {
    title: "Manage Students",
    description: "View and manage student records",
    href: `/manager/students`,
    icon: <Users className="h-5 w-5 text-blue-500" />,
    allowedRoles: ["owner", "manager", "receptionist"],
  },
  {
    title: "Manage Teachers",
    description: "View and manage teacher profiles",
    href: `/manager/teachers`,
    icon: <Briefcase className="h-5 w-5 text-green-500" />, // Changed from BookOpen to separate from courses
    allowedRoles: ["owner", "manager", "receptionist"],
  },
  {
    title: "Financial Logs",
    description: "Review revenue collections",
    href: `/manager/revenue`,
    icon: <TrendingUp className="h-5 w-5 text-amber-500" />, // Changed to TrendingUp to represent financial growth/tracking
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Manage Course Instances",
    description: "Edit active class schedules and instances",
    href: `/manager/course-instances`,
    icon: <CalendarDays className="h-5 w-5 text-red-500" />, // Changed to CalendarDays since instances are time/schedule-specific
    allowedRoles: ["owner", "manager", "receptionist"],
  },
  {
    title: "Manage Archives",
    description: "Check past historical records",
    href: `/manager/archive`,
    icon: <Archive className="h-5 w-5 text-amber-800" />,
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Manage Payouts",
    description: "Process student refunds and teacher payments",
    href: `/manager/payouts`,
    icon: <ReceiptCent className="h-5 w-5 text-emerald-600" />, // Changed to ReceiptCent for explicit outbound payment processing
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Manage Courses",
    description: "Create and process new courses",
    href: `/manager/courses`,
    icon: <GraduationCap className="h-5 w-5 text-indigo-600" />, // Changed to GraduationCap for higher-level academic courses
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Manage Levels",
    description: "Configure and process new grade levels",
    href: `/manager/gradeLevels`,
    icon: <Layers className="h-5 w-5 text-teal-600" />, // Changed to Layers to represent progressive academic tiers/levels
    allowedRoles: ["owner", "manager"],
  },
]

export default function DashboardHubPage() {
  const { user, profile, loading } = useAuth()
  const role = profile?.role // Use DB profile role (not JWT claim which may be missing)

  // 2. Filter down cards to only show what the current role is authorized to view
  const authorizedCards = ALL_NAVIGATION_CARDS.filter((card) => {
    if (!role) return false
    return card.allowedRoles.includes(role)
  })

  // 3. Handle loading state gracefully to avoid layout shifts or a flashing blank page
  if (loading || (!role && !user)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-lg border border-gray-200" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Global metrics could go here */}

      {/* Grid of quick navigation shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {authorizedCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition group flex justify-between items-center"
          >
            <div className="space-y-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {card.icon} {card.title}
              </h3>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  )
}