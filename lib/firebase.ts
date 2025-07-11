"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { firebaseConfig } from "./firebase-config"

// Firebase instances
let app: FirebaseApp
let auth: Auth
let db: Firestore
let isInitialized = false
let initializationError: string | null = null

// Initialize Firebase
try {
  if (typeof window !== "undefined") {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    // Initialize Auth and Firestore
    auth = getAuth(app)
    db = getFirestore(app)

    isInitialized = true
    console.log("✅ Firebase initialized successfully")
  }
} catch (error: any) {
  console.error("❌ Firebase initialization error:", error)
  initializationError = error.message
}

// Export status
export { isInitialized, initializationError }

// Export instances directly
export { app, auth, db }
export default app
