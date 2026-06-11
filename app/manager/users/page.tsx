"use client"
import UserManagementTab from "@/components/tabs/UserManagementTab"
import SummaryCards from "@/components/dashboard/SummaryCards"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <SummaryCards />
      <UserManagementTab />
    </div>
  )
}