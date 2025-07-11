import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: "user" | "admin"
  createdAt: Date
  itemsReported: number
  itemsFound: number
  successfulReunions: number
}

const ADMIN_EMAILS = ["admin@university.edu", "campusfind.admin@university.edu"]

export const signUp = async (email: string, password: string, name: string) => {
  if (!auth || !db) {
    throw new Error("Firebase not initialized")
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase())

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name,
      role: isAdmin ? "admin" : "user",
      createdAt: new Date(),
      itemsReported: 0,
      itemsFound: 0,
      successfulReunions: 0,
    }

    await setDoc(doc(db, "users", user.uid), userProfile)

    return { user, profile: userProfile }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const signIn = async (email: string, password: string) => {
  if (!auth || !db) {
    throw new Error("Firebase not initialized")
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const userDoc = await getDoc(doc(db, "users", user.uid))
    const profile = userDoc.exists() ? (userDoc.data() as UserProfile) : null

    return { user, profile }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const signOut = async () => {
  if (!auth) {
    throw new Error("Firebase not initialized")
  }

  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const resetPassword = async (email: string) => {
  if (!auth) {
    throw new Error("Firebase not initialized")
  }

  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) {
    console.error("Firestore not initialized")
    return null
  }

  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}
