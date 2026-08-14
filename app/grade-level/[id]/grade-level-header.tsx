"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit3 } from "lucide-react"
import { useRouter } from "next/navigation"

export function CourseHeader({ onEdit }: { onEdit?: () => void }) {
    const router = useRouter()

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-xl font-semibold text-gray-900">Grade Level</h1>
                    </div>
                    {onEdit && (
                        <Button variant="outline" size="sm" onClick={onEdit}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Grade Level
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
