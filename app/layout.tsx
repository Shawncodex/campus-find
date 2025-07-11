import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import FirebaseStatus from "@/components/firebase-status"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Campus Find - University Lost & Found Portal",
  description:
    "A modern, secure platform for students and staff to report, discover, and claim lost or found items on campus.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <FirebaseStatus />
        </AuthProvider>
      </body>
    </html>
  )
}
