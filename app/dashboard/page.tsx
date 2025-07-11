"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  User,
  Bell,
  Menu,
  X,
  LogOut,
  Filter,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getItems, type Item } from "@/lib/items"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import { optimizeImageUrl } from "@/lib/cloudinary"

export default function Dashboard() {
  const { user, profile, isAdmin } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("Fetching items for dashboard...")
        const fetchedItems = await getItems({
          type: selectedType === "all" ? undefined : (selectedType as "lost" | "found"),
          category: selectedCategory === "all" ? undefined : selectedCategory,
          searchTerm: searchTerm || undefined,
        })
        console.log("Dashboard items fetched:", fetchedItems.length)
        setItems(fetchedItems)
      } catch (error) {
        console.error("Error fetching items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [searchTerm, selectedCategory, selectedType, refreshTrigger])

  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused, refreshing items...")
      setRefreshTrigger((prev) => prev + 1)
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    setRefreshTrigger((prev) => prev + 1)
  }

  const categories = [
    "Electronics",
    "Bags",
    "ID/Cards",
    "Clothing",
    "Books",
    "Keys",
    "Jewelry",
    "Sports Equipment",
    "Water Bottles",
    "Umbrellas",
    "Other",
  ]

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
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Campus Find
                  </span>
                  <p className="text-xs text-gray-500">University Lost & Found</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/report" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Report Item
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Profile
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-red-600 hover:text-red-700 transition-colors font-medium">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {profile?.name?.split(" ")[0]}</span>
                  <Button size="sm" variant="outline" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </nav>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.nav
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden mt-4 pb-4 border-t pt-4"
                >
                  <div className="flex flex-col space-y-3">
                    <Link href="/dashboard" className="text-blue-600 font-medium">
                      Dashboard
                    </Link>
                    <Link href="/report" className="text-gray-600">
                      Report Item
                    </Link>
                    <Link href="/profile" className="text-gray-600">
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="text-red-600 font-medium">
                        Admin Panel
                      </Link>
                    )}
                    <Button size="sm" variant="outline" onClick={handleSignOut} className="w-fit">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {profile?.name?.split(" ")[0]}! 👋</h1>
              <p className="text-blue-100 mb-4">
                Ready to help reunite lost items with their owners? Browse recent finds or report something new.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/report">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    <Plus className="w-4 h-4 mr-2" />
                    Report Lost/Found Item
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Bell className="w-4 h-4 mr-2" />
                  View Notifications
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search for lost or found items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 text-lg border-0 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full sm:w-40 h-12">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="lost">Lost Items</SelectItem>
                        <SelectItem value="found">Found Items</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-40 h-12">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button className="h-12 px-6" variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Items Grid */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedType === "lost" ? "Lost Items" : selectedType === "found" ? "Found Items" : "All Items"}
                  <span className="text-gray-500 ml-2">({items.length})</span>
                </h2>
                <p className="text-gray-600">
                  {selectedType === "lost"
                    ? "Help others find their lost belongings"
                    : selectedType === "found"
                      ? "Claim items that belong to you"
                      : "Browse all lost and found items"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Tabs defaultValue="grid" className="hidden sm:block">
                  <TabsList>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-xl"></div>
                    <div className="bg-white p-4 rounded-b-xl border border-t-0">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden">
                        <div className="relative">
                          <img
                            src={
                              item.imageUrl
                                ? optimizeImageUrl(item.imageUrl, 400, 200)
                                : "/placeholder.svg?height=200&width=400"
                            }
                            alt={item.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=200&width=400"
                            }}
                          />
                          <div className="absolute top-3 left-3">
                            <Badge
                              variant={item.type === "lost" ? "destructive" : "default"}
                              className={`${item.type === "lost" ? "bg-red-500" : "bg-green-500"} text-white font-medium`}
                            >
                              {item.type === "lost" ? "Lost" : "Found"}
                            </Badge>
                          </div>
                          <div className="absolute top-3 right-3">
                            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                              {item.status === "open" ? "Open" : "Claimed"}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                          <div className="space-y-2 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="font-medium">{item.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-green-500" />
                              <span>
                                {item.date} at {item.time}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-purple-500" />
                              <span>{item.reporter?.name || item.reporterName}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-gray-100">
                                {item.category}
                              </Badge>
                              {item.claims && item.claims > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.claims} claim{item.claims > 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <Link href={`/item/${item.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                                >
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {items.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || selectedCategory !== "all" || selectedType !== "all"
                    ? "Try adjusting your search criteria or filters to find more items."
                    : "Be the first to report a lost or found item in your community!"}
                </p>
                <Link href="/report">
                  <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Report an Item
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Mobile Bottom Navigation */}
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t z-40"
        >
          <div className="flex items-center justify-around py-2">
            {[
              { icon: Search, label: "Browse", href: "/dashboard", active: true },
              { icon: Plus, label: "Report", href: "/report" },
              { icon: Bell, label: "Alerts", href: "/notifications" },
              { icon: User, label: "Profile", href: "/profile" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="flex flex-col items-center p-2">
                <item.icon className={`w-5 h-5 ${item.active ? "text-blue-600" : "text-gray-400"}`} />
                <span className={`text-xs mt-1 ${item.active ? "text-blue-600" : "text-gray-400"}`}>{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.nav>
      </div>
    </ProtectedRoute>
  )
}
