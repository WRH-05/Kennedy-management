"use client"
import { revalidateData } from "@/hooks/swr-config"
import ArchiveTab from "@/components/tabs/ArchiveTab"

export default function ArchivePage() {
  const handleArchiveUpdate = async () => {
    // When an archive action triggers, we force-refresh core metrics
    revalidateData('all')
  }

  return (
    <div className="space-y-6">
      <ArchiveTab isManager={true} onArchiveUpdate={handleArchiveUpdate} />
    </div>
  )
}