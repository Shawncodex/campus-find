"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { auth, isInitialized } from "@/lib/firebase"
import { getUserProfile, type UserProfile } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  authError: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  authError: null,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe = () => {}

    const initAuth = async () => {
      try {
        if (!isInitialized || !auth) {
          throw new Error("Firebase auth not initialized")
        }

        unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            setUser(user)

            if (user) {
              try {
                const userProfile = await getUserProfile(user.uid)
                setProfile(userProfile)
              } catch (error) {
                console.error("Error fetching user profile:", error)
                setProfile(null)
              }
            } else {
              setProfile(null)
            }

            setLoading(false)
          },
          (error) => {
            console.error("Auth state change error:", error)
            setAuthError(error.message)
            setLoading(false)
          },
        )
      } catch (error: any) {
        console.error("Error setting up auth listener:", error)
        setAuthError(error.message)
        setLoading(false)
      }
    }

    // Initialize auth
    initAuth()

    return () => {
      unsubscribe()
    }
  }, [])

  const isAdmin = profile?.role === "admin"

  return <AuthContext.Provider value={{ user, profile, loading, isAdmin, authError }}>{children}</AuthContext.Provider>
}
