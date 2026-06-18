import AuthGuard from "@/components/auth/AuthGuard"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import SummaryCards from "@/components/dashboard/SummaryCards"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRoles={['owner', 'manager']}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SummaryCards />
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}