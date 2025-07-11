"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Clock, ArrowLeft, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { createItem } from "@/lib/items"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import ImageUpload from "@/components/image-upload"

export default function ReportItem() {
  const [itemType, setItemType] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    time: "",
    image: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { user, profile } = useAuth()
  const router = useRouter()
  const [error, setError] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const locations = [
    "Main Library",
    "Student Center",
    "Engineering Building",
    "Science Building",
    "Business Building",
    "Arts Building",
    "Cafeteria/Dining Hall",
    "Gymnasium",
    "Dormitory/Residence Hall",
    "Parking Lot A",
    "Parking Lot B",
    "Parking Lot C",
    "Campus Quad",
    "Lecture Hall",
    "Computer Lab",
    "Other",
  ]

  const handleImageSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }))

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!user || !profile) {
      setError("You must be logged in to report an item")
      setIsSubmitting(false)
      return
    }

    // Validate required fields
    if (!itemType) {
      setError("Please select whether this is a lost or found item")
      setIsSubmitting(false)
      return
    }

    if (!formData.title.trim()) {
      setError("Please enter an item title")
      setIsSubmitting(false)
      return
    }

    if (!formData.description.trim()) {
      setError("Please enter a description")
      setIsSubmitting(false)
      return
    }

    if (!formData.category) {
      setError("Please select a category")
      setIsSubmitting(false)
      return
    }

    if (!formData.location) {
      setError("Please select a location")
      setIsSubmitting(false)
      return
    }

    if (!formData.date) {
      setError("Please select a date")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Submitting item:", {
        type: itemType,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        time: formData.time || "Not specified",
        reporterId: user.uid,
        reporterName: profile.name,
        reporterEmail: profile.email,
      })

      const newItem = await createItem(
        {
          type: itemType as "lost" | "found",
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          location: formData.location,
          date: formData.date,
          time: formData.time || "Not specified",
          status: "open",
          reporterId: user.uid,
          reporterName: profile.name,
          reporterEmail: profile.email,
        },
        formData.image || undefined,
      )

      console.log("Item created successfully:", newItem)
      setIsSubmitted(true)
    } catch (error: any) {
      console.error("Error creating item:", error)
      setError(`Failed to submit item: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm max-w-md">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {itemType === "lost" ? "Lost Item Reported!" : "Found Item Posted!"}
              </h2>
              <p className="text-gray-600 mb-6">
                Your {itemType} item has been added to the campus database.
                {itemType === "lost"
                  ? " You'll receive notifications if someone finds it."
                  : " The owner will be notified and can contact you."}
              </p>

              <div className="space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600">Back to Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({
                      title: "",
                      description: "",
                      category: "",
                      location: "",
                      date: "",
                      time: "",
                      image: null,
                    })
                    setItemType("")
                    setImagePreview(null)
                  }}
                >
                  Report Another Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Report an Item</h1>
                <p className="text-sm text-gray-600">Help reunite lost items with their owners</p>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <span>Item Details</span>
                </CardTitle>
                <CardDescription>Provide as much detail as possible to help others identify the item</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Item Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">What type of report is this? *</Label>
                    <RadioGroup value={itemType} onValueChange={setItemType} className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="lost" id="lost" />
                        <Label htmlFor="lost" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Badge variant="destructive" className="bg-red-500">
                            Lost
                          </Badge>
                          <span>I lost something</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="found" id="found" />
                        <Label htmlFor="found" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Badge className="bg-green-500">Found</Badge>
                          <span>I found something</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {itemType && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-6"
                    >
                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Item Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., iPhone 14 Pro, Blue Backpack, Student ID"
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          required
                          className="h-12"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder={
                            itemType === "lost"
                              ? "Describe the item and where you think you lost it. Include any distinctive features, colors, or markings..."
                              : "Describe the item and where you found it. Include any distinctive features that could help identify the owner..."
                          }
                          value={formData.description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          required
                          className="resize-none"
                        />
                      </div>

                      {/* Category and Location */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Location *</Label>
                          <Select
                            value={formData.location}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date *</Label>
                          <div className="relative">
                            <Input
                              id="date"
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                              required
                              className="h-12"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="time">Time (approximate)</Label>
                          <div className="relative">
                            <Input
                              id="time"
                              type="time"
                              value={formData.time}
                              onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                              className="h-12"
                            />
                            <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} disabled={isSubmitting} />

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-12 text-lg"
                        disabled={
                          isSubmitting ||
                          !itemType ||
                          !formData.title.trim() ||
                          !formData.description.trim() ||
                          !formData.category ||
                          !formData.location ||
                          !formData.date
                        }
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Upload className="w-5 h-5 mr-2" />
                        )}
                        {isSubmitting ? "Submitting..." : `Report ${itemType === "lost" ? "Lost" : "Found"} Item`}
                      </Button>

                      {/* Help Text */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 mb-1">Tips for better results:</p>
                            <ul className="text-blue-800 space-y-1">
                              <li>• Include specific details like brand, color, and size</li>
                              <li>• Add a clear photo if possible</li>
                              <li>• Be as specific as possible about the location</li>
                              <li>• Check back regularly for updates and claims</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
