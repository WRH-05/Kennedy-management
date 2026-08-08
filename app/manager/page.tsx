"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getAuthorizedNavigation } from "@/lib/navigation"

export default function DashboardHubPage() {
  const { user, profile, loading } = useAuth()
  const role = profile?.role // Use DB profile role (not JWT claim which may be missing)

  // 2. Filter down cards to only show what the current role is authorized to view
  const authorizedCards = getAuthorizedNavigation(role)

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