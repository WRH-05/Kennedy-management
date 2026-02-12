import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import ErrorBoundary from "@/components/ErrorBoundary"
import SWRProvider from "@/components/providers/SWRProvider"
import { Toaster } from "@/components/ui/toaster"

// Import token cleanup utility for development debugging
if (process.env.NODE_ENV === 'development') {
  import('@/utils/token-cleanup')
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kennedy Management System",
  description: "Educational institution management system",
  generator: 'v0.dev',
  icons: {
    icon: '/20250728_211539.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <SWRProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </SWRProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
