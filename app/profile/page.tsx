"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  User,
  Bell,
  Shield,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Camera,
  Save,
  X,
} from "lucide-react"
import Link from "next/link"
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { getUserItems, deleteItem, updateItemStatus, getItemClaims, type Item, type Claim } from "@/lib/items"
import { updateUserProfile, getUserStats } from "@/lib/admin"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"

interface UserStats {
  itemsReported: number
  itemsFound: number
  successfulReunions: number
  totalClaims: number
  successRate: number
}

interface RecentActivity {
  id: string
  action: string
  item: string
  time: string
  type: "lost" | "found" | "claim" | "success"
  timestamp: Date
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userItems, setUserItems] = useState<Item[]>([])
  const [userClaims, setUserClaims] = useState<Claim[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    itemsReported: 0,
    itemsFound: 0,
    successfulReunions: 0,
    totalClaims: 0,
    successRate: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  // Profile editing state
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    email: "",
  })

  const { user, profile } = useAuth()

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        name: profile.name || "",
        email: profile.email || "",
      })
    }
  }, [profile])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch user items, stats, and claims in parallel
        const [items, stats] = await Promise.all([getUserItems(user.uid), getUserStats(user.uid)])

        setUserItems(items)
        setUserStats(stats)

        // Fetch user's claims
        const claimsPromises = items.map((item) => getItemClaims(item.id!))
        const allClaims = await Promise.all(claimsPromises)
        const flatClaims = allClaims.flat().filter((claim) => claim.claimantId !== user.uid)
        setUserClaims(flatClaims)

        // Generate recent activity from items
        const activities: RecentActivity[] = []

        // Add item creation activities
        items.forEach((item) => {
          activities.push({
            id: `item-${item.id}`,
            action: `Reported ${item.type} item`,
            item: item.title,
            time: formatTimeAgo(new Date(item.createdAt.seconds * 1000)),
            type: item.type,
            timestamp: new Date(item.createdAt.seconds * 1000),
          })

          // Add status change activities
          if (item.status === "resolved") {
            activities.push({
              id: `resolved-${item.id}`,
              action: "Item reunited",
              item: item.title,
              time: formatTimeAgo(new Date(item.updatedAt.seconds * 1000)),
              type: "success",
              timestamp: new Date(item.updatedAt.seconds * 1000),
            })
          }
        })

        // Add claim activities
        flatClaims.forEach((claim) => {
          activities.push({
            id: `claim-${claim.id}`,
            action: "Received claim",
            item: items.find((item) => item.id === claim.itemId)?.title || "Unknown item",
            time: formatTimeAgo(new Date(claim.createdAt.seconds * 1000)),
            type: "claim",
            timestamp: new Date(claim.createdAt.seconds * 1000),
          })
        })

        // Sort by timestamp and take the 5 most recent
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        setRecentActivity(activities.slice(0, 5))
      } catch (error: any) {
        console.error("Error fetching profile data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data: " + error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time listeners for user's items (now with proper indexing)
    const itemsQuery = query(collection(db, "items"), where("reporterId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
      const items: Item[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        items.push({
          id: doc.id,
          ...data,
          reporter: data.reporter || {
            name: data.reporterName || "Unknown User",
            email: data.reporterEmail || "",
          },
          claims: data.claims || 0,
        } as Item)
      })

      setUserItems(items)

      // Update stats when items change
      const newStats = {
        itemsReported: items.length,
        itemsFound: items.filter((item) => item.type === "found").length,
        successfulReunions: items.filter((item) => item.status === "resolved").length,
        totalClaims: items.reduce((sum, item) => sum + (item.claims || 0), 0),
        successRate:
          items.length > 0
            ? Math.round((items.filter((item) => item.status === "resolved").length / items.length) * 100)
            : 0,
      }
      setUserStats(newStats)
    })

    return () => {
      unsubscribeItems()
    }
  }, [user])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      await updateUserProfile(user.uid, {
        name: editedProfile.name,
        email: editedProfile.email,
      })

      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId)
      setShowDeleteDialog(false)
      setDeleteTarget(null)
      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateItemStatus = async (itemId: string, status: Item["status"]) => {
    try {
      await updateItemStatus(itemId, status)
      toast({
        title: "Success",
        description: `Item status updated to ${status}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (id: string, title: string) => {
    setDeleteTarget({ id, title })
    setShowDeleteDialog(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your account and view your activity</p>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-1">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                      <Camera className="w-3 h-3" />
                    </Button>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-1">{profile?.name || "Unknown User"}</h2>
                  <p className="text-gray-600 text-sm mb-4">{profile?.email || "No email"}</p>
                  <Badge variant="outline" className="mb-6">
                    Member since{" "}
                    {profile?.createdAt
                      ? (
                          // Handle Firestore Timestamp or JS Date
                          (profile.createdAt as any).seconds !== undefined
                            ? new Date((profile.createdAt as any).seconds * 1000).toLocaleDateString()
                            : (profile.createdAt instanceof Date
                                ? profile.createdAt.toLocaleDateString()
                                : "N/A")
                        )
                      : "N/A"}
                  </Badge>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{userStats.itemsReported}</p>
                      <p className="text-xs text-gray-600">Reported</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{userStats.itemsFound}</p>
                      <p className="text-xs text-gray-600">Found</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{userStats.successfulReunions}</p>
                      <p className="text-xs text-gray-600">Reunited</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="items">My Items ({userItems.length})</TabsTrigger>
                  <TabsTrigger value="claims">Claims ({userClaims.length})</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your latest interactions on Campus Find</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                          recentActivity.map((activity, index) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50/50"
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  activity.type === "lost"
                                    ? "bg-red-100"
                                    : activity.type === "found"
                                      ? "bg-blue-100"
                                      : activity.type === "claim"
                                        ? "bg-yellow-100"
                                        : "bg-green-100"
                                }`}
                              >
                                {activity.type === "lost" && <XCircle className="w-5 h-5 text-red-600" />}
                                {activity.type === "found" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                                {activity.type === "claim" && <Bell className="w-5 h-5 text-yellow-600" />}
                                {activity.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{activity.action}</p>
                                <p className="text-gray-600 text-sm">{activity.item}</p>
                              </div>
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                            <p className="text-gray-600">Start reporting items to see your activity here.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Success Rate</span>
                            <span className="font-bold text-green-600">{userStats.successRate}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Claims</span>
                            <span className="font-bold">{userStats.totalClaims}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Active Items</span>
                            <span className="font-bold text-blue-600">
                              {userItems.filter((item) => item.status === "open").length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userStats.successfulReunions > 0 && (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-yellow-600" />
                              </div>
                              <span className="text-sm">First Reunion</span>
                            </div>
                          )}
                          {userStats.itemsReported >= 5 && (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm">Active Reporter</span>
                            </div>
                          )}
                          {userStats.successRate >= 80 && userStats.itemsReported >= 3 && (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Shield className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-sm">Trusted Member</span>
                            </div>
                          )}
                          {userStats.itemsReported === 0 && (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-sm">Complete actions to earn achievements!</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* My Items Tab */}
                <TabsContent value="items" className="space-y-6">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>My Reported Items</CardTitle>
                      <CardDescription>Items you've reported as lost or found</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userItems.length > 0 ? (
                          userItems.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    item.type === "lost" ? "bg-red-100" : "bg-green-100"
                                  }`}
                                >
                                  {item.type === "lost" ? (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                  ) : (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{item.title}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {item.location}
                                    </span>
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {new Date(item.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <Badge
                                  variant={
                                    item.status === "open"
                                      ? "default"
                                      : item.status === "claimed"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className={
                                    item.status === "open"
                                      ? "bg-blue-500"
                                      : item.status === "claimed"
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }
                                >
                                  {item.status}
                                </Badge>
                                {(item.claims || 0) > 0 && (
                                  <Badge variant="outline">
                                    {item.claims} claim{(item.claims || 0) > 1 ? "s" : ""}
                                  </Badge>
                                )}
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedItem(item)
                                      setShowItemDialog(true)
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => confirmDelete(item.id!, item.title)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No items reported</h3>
                            <p className="text-gray-600">Start by reporting a lost or found item.</p>
                            <Link href="/report">
                              <Button className="mt-4">Report an Item</Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Claims Tab */}
                <TabsContent value="claims" className="space-y-6">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Claims on Your Items</CardTitle>
                      <CardDescription>People who have claimed your reported items</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userClaims.length > 0 ? (
                          userClaims.map((claim, index) => (
                            <motion.div
                              key={claim.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Bell className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{claim.claimantName}</h3>
                                  <p className="text-sm text-gray-600">
                                    Claimed:{" "}
                                    {userItems.find((item) => item.id === claim.itemId)?.title || "Unknown item"}
                                  </p>
                                  <p className="text-xs text-gray-500">{claim.message}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <Badge
                                  variant={
                                    claim.status === "pending"
                                      ? "default"
                                      : claim.status === "approved"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {claim.status}
                                </Badge>
                                <p className="text-xs text-gray-500">{claim.date}</p>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
                            <p className="text-gray-600">When someone claims your items, they'll appear here.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editedProfile.name}
                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={editedProfile.email}
                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        {isEditing ? (
                          <>
                            <Button onClick={handleSaveProfile}>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false)
                                setEditedProfile({
                                  name: profile?.name || "",
                                  email: profile?.email || "",
                                })
                              }}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button onClick={() => setIsEditing(true)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Account Statistics</CardTitle>
                      <CardDescription>Your Campus Find activity summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Items Reported</span>
                            <span className="font-bold">{userStats.itemsReported}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Items Found</span>
                            <span className="font-bold text-green-600">{userStats.itemsFound}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Successful Reunions</span>
                            <span className="font-bold text-purple-600">{userStats.successfulReunions}</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Success Rate</span>
                            <span className="font-bold text-green-600">{userStats.successRate}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Claims Received</span>
                            <span className="font-bold">{userStats.totalClaims}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Account Status</span>
                            <Badge variant="default" className="bg-green-500">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>

        {/* Item Details Dialog */}
        <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
              <DialogDescription>View and manage your item</DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <p className="text-sm text-gray-600">{selectedItem.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Badge variant={selectedItem.type === "lost" ? "destructive" : "default"}>
                      {selectedItem.type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant="outline">{selectedItem.status}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <p className="text-sm text-gray-600">{selectedItem.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-sm text-gray-600">{selectedItem.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <p className="text-sm text-gray-600">{selectedItem.date}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedItem.description}</p>
                </div>
                {selectedItem.imageUrl && (
                  <div>
                    <label className="text-sm font-medium">Image</label>
                    <img
                      src={selectedItem.imageUrl || "/placeholder.svg"}
                      alt={selectedItem.title}
                      className="mt-2 max-w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowItemDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">
                <strong>Item:</strong> {deleteTarget?.title}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleteTarget && handleDeleteItem(deleteTarget.id)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
