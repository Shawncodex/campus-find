"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
  Shield,
  Users,
  AlertTriangle,
  Search,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserCheck,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import * as ItemsService from "@/lib/items"
import type { Item } from "@/lib/items"
import { getUsers, updateUserStatus, deleteUser, getAdminStats, checkAdminPermissions, type User } from "@/lib/admin"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminDashboard() {
  const { profile, authError } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeItems: 0,
    resolvedItems: 0,
    flaggedReports: 0,
    newUsersThisWeek: 0,
    itemsThisWeek: 0,
    successfulReunions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "claimed" | "resolved">("all")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "item" | "user"; id: string; title: string } | null>(null)

  useEffect(() => {
    const checkPermissions = async () => {
      if (profile?.uid) {
        try {
          const adminStatus = await checkAdminPermissions(profile.uid)
          setIsAdmin(adminStatus)
          if (!adminStatus) {
            setError("You don't have admin permissions. Please contact an administrator to grant you admin access.")
          }
        } catch (error: any) {
          console.error("Error checking admin permissions:", error)
          setError("Failed to verify admin permissions: " + error.message)
        }
      }
    }

    if (profile) {
      checkPermissions()
    }
  }, [profile])

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin, authError])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (authError) {
        setError(authError)
        return
      }

      if (!isAdmin) {
        setError("Admin permissions required")
        return
      }

      console.log("Fetching admin data...")

      // Fetch all data in parallel
      const [allItems, allUsers, adminStats] = await Promise.all([ItemsService.getItems(), getUsers(), getAdminStats()])

      console.log(`Fetched ${allItems.length} items, ${allUsers.length} users`)
      setItems(allItems)
      setUsers(allUsers)
      setStats(adminStats)
      setError(null)
    } catch (error: any) {
      console.error("Error fetching admin data:", error)

      if (error.message && error.message.includes("permission")) {
        setError(
          "Firebase permission error. Please ensure your user has admin privileges and the security rules are properly configured.",
        )
      } else {
        setError(error.message || "Failed to load admin data")
      }

      toast({
        title: "Error",
        description: "Failed to load admin data: " + (error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      console.log("Attempting to delete item:", itemId)
      await ItemsService.deleteItem(itemId)
      setItems(items.filter((item) => item.id !== itemId))
      setShowDeleteDialog(false)
      setDeleteTarget(null)
      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    } catch (error: any) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateItemStatus = async (itemId: string, status: Item["status"]) => {
    try {
      await ItemsService.updateItemStatus(itemId, status)
      setItems(items.map((item) => (item.id === itemId ? { ...item, status } : item)))
      toast({
        title: "Success",
        description: `Item status updated to ${status}`,
      })
    } catch (error: any) {
      console.error("Update status error:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateUserStatus = async (userId: string, status: User["status"]) => {
    try {
      await updateUserStatus(userId, status)
      setUsers(users.map((user) => (user.id === userId ? { ...user, status } : user)))
      toast({
        title: "Success",
        description: `User ${status === "banned" ? "banned" : "activated"} successfully`,
      })
    } catch (error: any) {
      console.error("Update user status error:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log("Attempting to delete user:", userId)
      await deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
      setShowDeleteDialog(false)
      setDeleteTarget(null)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error: any) {
      console.error("Delete user error:", error)
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (type: "item" | "user", id: string, title: string) => {
    setDeleteTarget({ type, id, title })
    setShowDeleteDialog(true)
  }

  const executeDelete = async () => {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === "item") {
        await handleDeleteItem(deleteTarget.id)
      } else {
        await handleDeleteUser(deleteTarget.id)
      }
    } catch (error) {
      console.error("Execute delete error:", error)
      // Error handling is done in the individual functions
    }
  }

  // Filter items based on search and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === "all" || item.type === filterType
    const matchesStatus = filterStatus === "all" || item.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Loading admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <CardTitle>Admin Access Required</CardTitle>
            </div>
            <CardDescription>Unable to access admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <p className="font-medium">To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Ensure your user document has an "isAdmin: true" field</li>
                <li>Update your Firebase security rules to include admin permissions</li>
                <li>Contact your system administrator for admin access</li>
              </ol>
            </div>

            <Button onClick={fetchData} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center space-x-2 text-yellow-600">
              <Shield className="h-6 w-6" />
              <CardTitle>Admin Access Required</CardTitle>
            </div>
            <CardDescription>You need admin privileges to access this dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>Please contact your system administrator to grant you admin access.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
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
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Campus Find Administration Panel</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button onClick={fetchData} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Badge variant="destructive" className="bg-red-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Access
                </Badge>
              </div>
            </div>
          </div>
        </motion.header>

        {process.env.NODE_ENV === "development" && (
          <div className="container mx-auto px-4 py-2">
          
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
              <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    title: "Total Users",
                    value: stats.totalUsers,
                    icon: Users,
                    color: "blue",
                    change: stats.newUsersThisWeek,
                    changeLabel: "new this week",
                  },
                  {
                    title: "Active Items",
                    value: stats.activeItems,
                    icon: Search,
                    color: "green",
                    change: stats.itemsThisWeek,
                    changeLabel: "added this week",
                  },
                  {
                    title: "Resolved Items",
                    value: stats.resolvedItems,
                    icon: CheckCircle,
                    color: "purple",
                    change: stats.successfulReunions,
                    changeLabel: "successful reunions",
                  },
                  {
                    title: "Flagged Reports",
                    value: stats.flaggedReports,
                    icon: AlertTriangle,
                    color: "red",
                    change: 0,
                    changeLabel: "pending review",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              {stat.change > 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1 text-gray-400" />
                              )}
                              <span>
                                {stat.change} {stat.changeLabel}
                              </span>
                            </div>
                          </div>
                          <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>Recent Items</span>
                      </CardTitle>
                      <CardDescription>Latest reported items</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {items.slice(0, 5).map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  item.type === "lost" ? "bg-red-100" : "bg-green-100"
                                }`}
                              >
                                {item.type === "lost" ? (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.title}</p>
                                <p className="text-gray-600 text-xs">{item.reporterName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={item.status === "open" ? "default" : "secondary"} className="text-xs">
                                {item.status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">No items found</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Recent Users</span>
                      </CardTitle>
                      <CardDescription>Latest user registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {users.slice(0, 5).map((user, index) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-gray-600 text-xs">{user.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={user.status === "active" ? "default" : "destructive"} className="text-xs">
                                {user.status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">{user.itemsReported} items</p>
                            </div>
                          </div>
                        ))}
                        {users.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">No users found</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Items Management Tab */}
            <TabsContent value="items" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Item Management</CardTitle>
                      <CardDescription>Monitor and moderate reported items</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                      <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                          <SelectItem value="found">Found</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="claimed">Claimed</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
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
                              <span>By {item.reporterName}</span>
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                              <span>{item.location}</span>
                              {item.claims && item.claims > 0 && (
                                <span className="text-blue-600">{item.claims} claims</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              item.status === "open" ? "default" : item.status === "resolved" ? "secondary" : "outline"
                            }
                            className={
                              item.status === "open"
                                ? "bg-blue-500"
                                : item.status === "resolved"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                            }
                          >
                            {item.status}
                          </Badge>
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
                              onClick={() => confirmDelete("item", item.id!, item.title)}
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Monitor and manage user accounts</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{user.email}</span>
                              <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                              <span>{user.itemsReported} items reported</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={user.status === "active" ? "default" : "destructive"}
                            className={user.status === "active" ? "bg-green-500" : "bg-red-500"}
                          >
                            {user.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowUserDialog(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateUserStatus(user.id!, user.status === "active" ? "banned" : "active")
                              }
                              className={
                                user.status === "active"
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-green-600 hover:text-green-700"
                              }
                              title={user.status === "active" ? "Ban user" : "Activate user"}
                            >
                              {user.status === "active" ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => confirmDelete("user", user.id!, user.name)}
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">Try adjusting your search.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Flagged Reports</span>
                  </CardTitle>
                  <CardDescription>Review and moderate flagged content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged reports</h3>
                    <p className="text-gray-600">All reports are currently clean. Flagged content will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Item Details Dialog */}
        <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
              <DialogDescription>View and manage item information</DialogDescription>
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
                <div>
                  <label className="text-sm font-medium">Reporter</label>
                  <p className="text-sm text-gray-600">
                    {selectedItem.reporterName} ({selectedItem.reporterEmail})
                  </p>
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
              <div className="flex space-x-2">
                <Select
                  value={selectedItem?.status}
                  onValueChange={(value: any) => {
                    if (selectedItem) {
                      handleUpdateItemStatus(selectedItem.id!, value)
                      setSelectedItem({ ...selectedItem, status: value })
                    }
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowItemDialog(false)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>View and manage user information</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-gray-600">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Join Date</label>
                    <p className="text-sm text-gray-600">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Items Reported</label>
                    <p className="text-sm text-gray-600">{selectedUser.itemsReported}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <div className="flex space-x-2">
                <Button
                  variant={selectedUser?.status === "active" ? "destructive" : "default"}
                  onClick={() => {
                    if (selectedUser) {
                      const newStatus = selectedUser.status === "active" ? "banned" : "active"
                      handleUpdateUserStatus(selectedUser.id!, newStatus)
                      setSelectedUser({ ...selectedUser, status: newStatus })
                    }
                  }}
                >
                  {selectedUser?.status === "active" ? "Ban User" : "Activate User"}
                </Button>
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">
                <strong>{deleteTarget?.type === "item" ? "Item" : "User"}:</strong> {deleteTarget?.title}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={executeDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
