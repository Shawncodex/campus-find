"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  MapPin,
  Clock,
  Users,
  Shield,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Zap,
  Heart,
  Star,
  ArrowRight,
  BookOpen,
  Coffee,
  Headphones,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, signUp, resetPassword } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [resetEmailSent, setResetEmailSent] = useState(false)

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleAuth = async (type: "login" | "signup") => {
    setIsLoading(true)
    setError("")

    try {
      if (type === "signup") {
        await signUp(formData.email, formData.password, formData.name)
      } else {
        await signIn(formData.email, formData.password)
      }
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address")
      return
    }

    try {
      await resetPassword(formData.email)
      setResetEmailSent(true)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find lost items quickly with our advanced search and filtering system",
      color: "blue",
    },
    {
      icon: MapPin,
      title: "Location Tracking",
      description: "Precise campus location data helps reunite items with their owners",
      color: "green",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant notifications when someone finds your lost item",
      color: "purple",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "University-verified accounts ensure a safe and trusted community",
      color: "red",
    },
  ]

  const stats = [
    { number: "2,500+", label: "Active Students", icon: Users },
    { number: "850+", label: "Items Reunited", icon: Heart },
    { number: "95%", label: "Success Rate", icon: Star },
    { number: "24/7", label: "Available", icon: Clock },
  ]

  const recentFinds = [
    { icon: Smartphone, item: "iPhone 14", location: "Library", time: "2h ago" },
    { icon: BookOpen, item: "Textbook", location: "Engineering", time: "4h ago" },
    { icon: Coffee, item: "Water Bottle", location: "Cafeteria", time: "6h ago" },
    { icon: Headphones, item: "AirPods", location: "Student Center", time: "8h ago" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Campus Find
                </span>
                <p className="text-xs text-gray-500">University Lost & Found</p>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                How it Works
              </Link>
              <Link href="#stats" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Stats
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setAuthMode("login")
                  setShowAuthModal(true)
                }}
                className="font-medium"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setAuthMode("signup")
                  setShowAuthModal(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 font-medium"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
              >
                <Zap className="w-4 h-4" />
                <span>Trusted by 2,500+ Students</span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Lost Something?
                <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  We'll Help You Find It.
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 leading-relaxed max-w-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                The university's most trusted platform for reuniting lost items with their owners. Join thousands of
                students who've successfully recovered their belongings.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                onClick={() => {
                  setAuthMode("signup")
                  setShowAuthModal(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6"
              >
                Start Finding Items
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setAuthMode("login")
                  setShowAuthModal(true)
                }}
                className="text-lg px-8 py-6 border-2"
              >
                I Have an Account
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center space-x-6 text-sm text-gray-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>University Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span>Instant Alerts</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl blur-3xl opacity-20"></div>
            <Card className="relative border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Items found in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentFinds.map((find, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <find.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{find.item}</p>
                      <p className="text-xs text-gray-600">{find.location}</p>
                    </div>
                    <span className="text-xs text-gray-500">{find.time}</span>
                  </motion.div>
                ))}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setAuthMode("signup")
                      setShowAuthModal(true)
                    }}
                  >
                    View All Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="bg-white/50 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Our University Community</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who have successfully reunited with their lost belongings
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Students Choose Campus Find</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform is designed specifically for university communities, making it easier than ever to recover lost
            items
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
                <CardContent className="pt-8 pb-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-${feature.color}-100 to-${feature.color}-200 flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-r from-blue-600 to-green-600 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Getting started is simple. Follow these three easy steps to find or report items.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up with your university email to join our trusted community",
              },
              {
                step: "02",
                title: "Report or Search",
                description: "Post lost items or browse found items with our smart search system",
              },
              {
                step: "03",
                title: "Get Reunited",
                description: "Connect with finders or claimants and safely recover your belongings",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center text-white"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-blue-100 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-50 to-green-50 max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Find Your Lost Items?</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Join our community today and never worry about losing your belongings on campus again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    setAuthMode("signup")
                    setShowAuthModal(true)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setAuthMode("login")
                    setShowAuthModal(true)
                  }}
                  className="text-lg px-8 py-6 border-2"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Campus Find</span>
              </div>
              <p className="text-gray-400">The university's trusted platform for lost and found items.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-white transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#stats" className="hover:text-white transition-colors">
                    Statistics
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/setup" className="hover:text-white transition-colors">
                    Setup Guide
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@campusfind.edu" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">University</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Campus Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Student Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Campus Find. Built for university communities.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-between items-center">
                  <div></div>
                  <CardTitle className="text-2xl font-bold">
                    {authMode === "login" ? "Welcome Back" : "Join Campus Find"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAuthModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                </div>
                <CardDescription>
                  {authMode === "login" ? "Sign in to your account to continue" : "Create your account to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {resetEmailSent && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Password reset email sent! Check your inbox.</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">University Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    onClick={() => handleAuth(authMode)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : authMode === "login" ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {authMode === "login" && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      {authMode === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
