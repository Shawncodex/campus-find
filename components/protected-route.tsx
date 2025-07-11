"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin, authError } = useAuth()
  const router = useRouter()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (authError) {
      setShowError(true)
      return
    }

    if (!loading) {
      if (!user) {
        router.push("/")
        return
      }

      if (requireAdmin && !isAdmin) {
        router.push("/dashboard")
        return
      }
    }
  }, [user, profile, loading, isAdmin, requireAdmin, router, authError])

  if (showError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-xl font-bold">Firebase Initialization Error</h2>
          </div>

          <Alert variant="destructive">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>

          <p className="text-gray-600">There was a problem connecting to Firebase. This could be due to:</p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Network connectivity issues</li>
            <li>Firebase configuration problems</li>
            <li>Browser privacy settings or extensions</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={() => window.location.reload()} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            <Link href="/setup" className="flex-1">
              <Button variant="outline" className="w-full">
                View Setup Guide
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null
  }

  return <>{children}</>
}
