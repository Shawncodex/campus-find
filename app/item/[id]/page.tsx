"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  MessageCircle,
  Heart,
  Share2,
  Flag,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

import { getItem, getItemClaims, createClaim, type Item, type Claim } from "@/lib/items"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { useParams } from "next/navigation"
import { optimizeImageUrl } from "@/lib/cloudinary"

export default function ItemDetail() {
  const [item, setItem] = useState<Item | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const params = useParams()

  const [claimMessage, setClaimMessage] = useState("")
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false)
  const [hasSubmittedClaim, setHasSubmittedClaim] = useState(false)

  useEffect(() => {
    const fetchItemData = async () => {
      if (!params?.id) return

      try {
        console.log("Fetching item data for ID:", params.id)
        const itemData = await getItem(params.id as string)

        if (itemData) {
          setItem(itemData)
          console.log("Item data fetched successfully:", itemData)

          // Fetch claims for this item
          try {
            const claimsData = await getItemClaims(params.id as string)
            setClaims(claimsData)
            console.log("Claims data fetched successfully:", claimsData)
          } catch (claimsError) {
            console.error("Error fetching claims:", claimsError)
            // Continue without claims if there's an error
            setClaims([])
          }
        } else {
          console.log("Item not found")
        }
      } catch (error) {
        console.error("Error fetching item:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItemData()
  }, [params?.id])

  const handleSubmitClaim = async () => {
    if (!user || !profile || !item) return

    setIsSubmittingClaim(true)

    try {
      await createClaim({
        itemId: item.id!,
        claimantId: user.uid,
        claimantName: profile.name,
        claimantEmail: profile.email,
        message: claimMessage,
        status: "pending",
      })

      setHasSubmittedClaim(true)
      setClaimMessage("")

      // Refresh claims
      try {
        const updatedClaims = await getItemClaims(item.id!)
        setClaims(updatedClaims)
      } catch (error) {
        console.error("Error refreshing claims:", error)
      }
    } catch (error: any) {
      console.error("Error submitting claim:", error)
    } finally {
      setIsSubmittingClaim(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      </ProtectedRoute>
    )
  }

  if (!item) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
            <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Item Image and Basic Info */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="relative">
                    <img
                      src={
                        item.imageUrl
                          ? optimizeImageUrl(item.imageUrl, 800, 400)
                          : "/placeholder.svg?height=400&width=800"
                      }
                      alt={item.title}
                      className="w-full h-64 md:h-80 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=400&width=800"
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant={item.type === "lost" ? "destructive" : "default"}
                        className={`${item.type === "lost" ? "bg-red-500" : "bg-green-500"} text-white`}
                      >
                        {item.type === "lost" ? "Lost Item" : "Found Item"}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                        {item.status === "open" ? "Open" : "Claimed"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                        <Badge variant="secondary" className="mb-4">
                          {item.category}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6">{item.description}</p>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{item.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{item.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{item.time}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Claims Section */}
              {claims.length > 0 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5" />
                        <span>Claims & Responses ({claims.length})</span>
                      </CardTitle>
                      <CardDescription>People who think they might have found this item</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {claims.map((claim) => (
                        <div key={claim.id} className="border rounded-lg p-4 bg-gray-50/50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{claim.claimantName}</p>
                                <p className="text-xs text-gray-500">{claim.date}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {claim.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{claim.message}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Reporter Info */}
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Reported By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={item.reporter?.avatar || "/placeholder.svg?height=48&width=48"}
                        alt={item.reporter?.name}
                        className="w-12 h-12 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=48&width=48"
                        }}
                      />
                      <div>
                        <p className="font-medium">{item.reporter?.name}</p>
                        <p className="text-sm text-gray-600">{item.reporter?.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Reporter
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Claim Form */}
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {item.type === "lost" ? "Found This Item?" : "Is This Yours?"}
                    </CardTitle>
                    <CardDescription>
                      {item.type === "lost"
                        ? "Let the owner know you found their item"
                        : "Claim this item if it belongs to you"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasSubmittedClaim ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-4"
                      >
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="font-medium text-green-900 mb-2">Claim Submitted!</h3>
                        <p className="text-sm text-green-700">
                          The reporter will be notified and can contact you if it's a match.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="claim-message">Message (optional)</Label>
                          <Textarea
                            id="claim-message"
                            placeholder={
                              item.type === "lost"
                                ? "Describe where you found it and any identifying details..."
                                : "Provide proof that this item belongs to you..."
                            }
                            value={claimMessage}
                            onChange={(e) => setClaimMessage(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                          onClick={handleSubmitClaim}
                          disabled={isSubmittingClaim}
                        >
                          {isSubmittingClaim ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          {isSubmittingClaim ? "Submitting..." : "Submit Claim"}
                        </Button>

                        <div className="flex items-start space-x-2 text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p>
                            Only submit a claim if you genuinely believe this is your item or if you found it. False
                            claims may result in account suspension.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="w-4 h-4 mr-2" />
                      Save to Favorites
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share with Friends
                    </Button>
                    <Separator />
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      <Flag className="w-4 h-4 mr-2" />
                      Report Issue
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
