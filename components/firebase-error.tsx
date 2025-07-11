"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function FirebaseError() {
  const { authError } = useAuth()

  if (!authError) return null

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 text-red-900">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle>Firebase Configuration Error</CardTitle>
          </div>
          <CardDescription className="text-red-700">There was a problem initializing Firebase</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm text-gray-600">
            <p>This could be due to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Missing or incorrect Firebase configuration</li>
              <li>Network connectivity issues</li>
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
                View Setup Guide
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
