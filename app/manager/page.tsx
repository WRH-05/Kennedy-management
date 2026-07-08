"use client"

import Link from "next/link"
import { ArrowRight, Users, BookOpen, DollarSign, Archive, LibraryBig, Banknote, Book, ScrollText } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function DashboardHubPage() {
  const { user } = useAuth()
  // Clean fallback if role isn't populated yet
  const role = user?.user_role

  // 1. Define all navigation options centrally
  const allNavigationCards = [
    {
      title: "Manage Students",
      description: "View directories and status mappings",
      href: `/manager/students`,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      allowedRoles: ["manager", "receptionist"], // specify who can see what
    },
    {
      title: "Manage Teachers",
      description: "Track assignments and payouts",
      href: `/manager/teachers`,
      icon: <BookOpen className="h-5 w-5 text-green-500" />,
      allowedRoles: ["manager", "receptionist"],
    },
    {
      title: "Financial Logs",
      description: "Review revenue collections",
      href: `/manager/revenue`,
      icon: <DollarSign className="h-5 w-5 text-amber-500" />,
      allowedRoles: ["manager"],
    },
    {
      title: "Manage Course Instances",
      description: "Edit classes and curriculum",
      href: `/manager/course-instances`,
      icon: <LibraryBig className="h-5 w-5 text-red-500" />,
      allowedRoles: ["manager", "receptionist"],
    },
    {
      title: "Manage Archives",
      description: "Check past student records",
      href: `/manager/archive`,
      icon: <Archive className="h-5 w-5 text-amber-800" />,
      allowedRoles: ["manager"],
    },
    {
      title: "Manage Payouts",
      description: "Process partner and contractor earnings",
      href: `/manager/payouts`,
      icon: <Banknote className="h-5 w-5 text-green-700" />,
      allowedRoles: ["manager"],
    },
    {
      title: "Manage Courses",
      description: "Process new courses",
      href: `/manager/courses`,
      icon: <Book className="h-5 w-5 text-green-700" />,
      allowedRoles: ["manager"],
    },
    {
      title: "Manage Levels",
      description: "Process new Levels",
      href: `/manager/gradeLevels`,
      icon: <ScrollText className="h-5 w-5 text-green-700" />,
      allowedRoles: ["manager"],
    },
  ]

  // 2. Filter down cards to only show what the current role is authorized to view
  const authorizedCards = allNavigationCards.filter((card) => {
    if (!role) return false
    return card.allowedRoles.includes(role)
  })

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