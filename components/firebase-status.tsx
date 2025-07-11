"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, RefreshCw, ExternalLink, XCircle } from "lucide-react"
import Link from "next/link"
import { isCloudinaryConfigured } from "@/lib/cloudinary"
import { auth, db, isInitialized, initializationError } from "@/lib/firebase"

export default function FirebaseStatus() {
  const [showStatus, setShowStatus] = useState(false)
  const [detailedStatus, setDetailedStatus] = useState({
    app: false,
    auth: false,
    firestore: false,
    cloudinary: false,
  })

  useEffect(() => {
    // Check detailed Firebase status
    setDetailedStatus({
      app: isInitialized,
      auth: !!auth,
      firestore: !!db,
      cloudinary: isCloudinaryConfigured(),
    })

    // Show in development or if there's an error
    if (process.env.NODE_ENV === "development" || initializationError) {
      setShowStatus(true)
    }
  }, [])

  if (!showStatus) return null

  // If there's a critical Firebase error, show full-screen error
  if (initializationError) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 text-red-900">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle>Firebase Connection Error</CardTitle>
            </div>
            <CardDescription className="text-red-700">Unable to initialize Firebase services</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{initializationError}</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Service Status:</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Firebase App:</span>
                  {detailedStatus.app ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication:</span>
                  {detailedStatus.auth ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Firestore:</span>
                  {detailedStatus.firestore ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>This could be due to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Network connectivity issues</li>
                <li>Browser blocking Firebase requests</li>
                <li>Firebase services being temporarily unavailable</li>
                <li>Ad blockers or security extensions</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={() => window.location.reload()} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Link href="/setup" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Setup Guide
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  
  
}
