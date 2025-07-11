import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  getCountFromServer,
  getDoc,
} from "firebase/firestore"
import { db } from "./firebase"

export interface User {
  id?: string
  name: string
  email: string
  joinDate: string
  itemsReported: number
  status: "active" | "banned"
  createdAt?: Timestamp
  lastLogin?: Timestamp
}

export interface AdminStats {
  totalUsers: number
  activeItems: number
  resolvedItems: number
  flaggedReports: number
  newUsersThisWeek: number
  itemsThisWeek: number
  successfulReunions: number
}

export const getUsers = async (): Promise<User[]> => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    // Remove orderBy to avoid index requirement
    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q)
    const users: User[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        name: data.name || data.displayName || "Unknown User",
        email: data.email || "",
        joinDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        itemsReported: data.itemsReported || 0,
        status: data.status || "active",
        createdAt: data.createdAt,
        lastLogin: data.lastLogin,
      })
    })

    // Sort client-side by creation date (newest first)
    users.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })

    // Get items count for each user
    const itemsSnapshot = await getDocs(collection(db, "items"))
    const userItemCounts: { [key: string]: number } = {}

    itemsSnapshot.forEach((doc) => {
      const data = doc.data()
      const reporterId = data.reporterId
      if (reporterId) {
        userItemCounts[reporterId] = (userItemCounts[reporterId] || 0) + 1
      }
    })

    // Update users with actual item counts
    return users.map((user) => ({
      ...user,
      itemsReported: userItemCounts[user.id!] || 0,
    }))
  } catch (error: any) {
    console.error("Error in getUsers:", error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

export const updateUserStatus = async (userId: string, status: User["status"]) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      status,
      updatedAt: Timestamp.now(),
    })
  } catch (error: any) {
    throw new Error(`Failed to update user status: ${error.message}`)
  }
}

export const deleteUser = async (userId: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  if (!userId) {
    throw new Error("User ID is required")
  }

  try {
    console.log("Deleting user from Firestore:", userId)
    const userRef = doc(db, "users", userId)

    // Check if user exists first
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      throw new Error("User not found")
    }

    await deleteDoc(userRef)
    console.log("User deleted successfully:", userId)
  } catch (error: any) {
    console.error("Error deleting user:", error)
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}

export const getAdminStats = async (): Promise<AdminStats> => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    console.log("Fetching admin stats...")

    // Get total counts with fallback error handling
    const [usersSnapshot, itemsSnapshot] = await Promise.all([
      getCountFromServer(collection(db, "users")).catch((error) => {
        console.warn("Failed to get user count, falling back to manual count:", error)
        return getDocs(collection(db, "users")).then((snapshot) => ({ data: () => ({ count: snapshot.size }) }))
      }),
      getDocs(collection(db, "items")),
    ])

    const totalUsers = usersSnapshot.data().count

    // Process items data
    const items = itemsSnapshot.docs.map((doc) => doc.data())
    const activeItems = items.filter((item) => item.status === "open").length
    const resolvedItems = items.filter((item) => item.status === "resolved").length
    const successfulReunions = items.filter((item) => item.status === "claimed" || item.status === "resolved").length

    // Calculate weekly stats
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo)

    const itemsThisWeek = items.filter(
      (item) => item.createdAt && item.createdAt.seconds > oneWeekAgoTimestamp.seconds,
    ).length

    // Get new users this week with fallback to avoid index requirement
    let newUsersThisWeek = 0
    try {
      // Try the optimized query first
      const usersQuery = query(collection(db, "users"), where("createdAt", ">", oneWeekAgoTimestamp))
      const newUsersSnapshot = await getDocs(usersQuery)
      newUsersThisWeek = newUsersSnapshot.size
    } catch (error) {
      console.warn("Index not ready for users query, using fallback method:", error)
      // Fallback: get all users and filter client-side
      const allUsersSnapshot = await getDocs(collection(db, "users"))
      newUsersThisWeek = allUsersSnapshot.docs.filter((doc) => {
        const data = doc.data()
        return data.createdAt && data.createdAt.seconds > oneWeekAgoTimestamp.seconds
      }).length
    }

    console.log("Admin stats fetched successfully")

    return {
      totalUsers,
      activeItems,
      resolvedItems,
      flaggedReports: 0, // Implement flagging system as needed
      newUsersThisWeek,
      itemsThisWeek,
      successfulReunions,
    }
  } catch (error: any) {
    console.error("Error in getAdminStats:", error)
    throw new Error(`Failed to fetch admin stats: ${error.message}`)
  }
}

export const flagItem = async (itemId: string, reason: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const itemRef = doc(db, "items", itemId)
    await updateDoc(itemRef, {
      flagged: true,
      flagReason: reason,
      flaggedAt: Timestamp.now(),
    })
  } catch (error: any) {
    throw new Error(`Failed to flag item: ${error.message}`)
  }
}

export const unflagItem = async (itemId: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const itemRef = doc(db, "items", itemId)
    await updateDoc(itemRef, {
      flagged: false,
      flagReason: null,
      flaggedAt: null,
      reviewedAt: Timestamp.now(),
    })
  } catch (error: any) {
    throw new Error(`Failed to unflag item: ${error.message}`)
  }
}

export const checkAdminPermissions = async (userId: string): Promise<boolean> => {
  if (!db || !userId) {
    console.log("No database or userId provided")
    return false
  }

  try {
    console.log("Checking admin permissions for user:", userId)
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      console.log("User data:", { isAdmin: userData.isAdmin, role: userData.role })
      const isAdmin = userData.isAdmin === true || userData.role === "admin"
      console.log("Admin status:", isAdmin)
      return isAdmin
    } else {
      console.log("User document does not exist")
    }

    return false
  } catch (error) {
    console.error("Error checking admin permissions:", error)
    return false
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error: any) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
}

export const getUserProfile = async (userId: string): Promise<User | null> => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()
      return {
        id: userSnap.id,
        name: data.name || data.displayName || "Unknown User",
        email: data.email || "",
        joinDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        itemsReported: data.itemsReported || 0,
        status: data.status || "active",
        createdAt: data.createdAt,
        lastLogin: data.lastLogin,
      }
    }

    return null
  } catch (error: any) {
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }
}

export const getUserStats = async (userId: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    // Get user's items
    const itemsQuery = query(collection(db, "items"), where("reporterId", "==", userId))
    const itemsSnapshot = await getDocs(itemsQuery)

    const items = itemsSnapshot.docs.map((doc) => doc.data())
    const itemsReported = items.length
    const itemsFound = items.filter((item) => item.type === "found").length
    const successfulReunions = items.filter((item) => item.status === "resolved").length

    // Get user's claims
    const claimsQuery = query(collection(db, "claims"), where("claimantId", "==", userId))
    const claimsSnapshot = await getDocs(claimsQuery)
    const totalClaims = claimsSnapshot.size

    // Calculate success rate
    const successRate = itemsReported > 0 ? Math.round((successfulReunions / itemsReported) * 100) : 0

    return {
      itemsReported,
      itemsFound,
      successfulReunions,
      totalClaims,
      successRate,
    }
  } catch (error: any) {
    throw new Error(`Failed to fetch user stats: ${error.message}`)
  }
}
