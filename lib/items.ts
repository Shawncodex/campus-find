import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { uploadToCloudinary, convertToBase64 } from "./cloudinary"

export interface Item {
  id?: string
  type: "lost" | "found"
  title: string
  description: string
  category: string
  location: string
  date: string
  time: string
  status: "open" | "claimed" | "resolved"
  imageUrl?: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  createdAt: Timestamp
  updatedAt: Timestamp
  claims?: number
  reporter?: {
    name: string
    email: string
    avatar?: string
  }
}

export interface Claim {
  id?: string
  itemId: string
  claimantId: string
  claimantName: string
  claimantEmail: string
  message: string
  status: "pending" | "approved" | "rejected"
  createdAt: Timestamp
  date: string
}

export const createItem = async (itemData: Omit<Item, "id" | "createdAt" | "updatedAt">, imageFile?: File) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    let imageUrl = ""

    if (imageFile) {
      try {
        // Try Cloudinary first
        imageUrl = await uploadToCloudinary(imageFile)
      } catch (error) {
        // Fallback to base64 for small images
        if (imageFile.size < 1024 * 1024) {
          imageUrl = await convertToBase64(imageFile)
        }
      }
    }

    const item: Omit<Item, "id"> = {
      ...itemData,
      imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      claims: 0,
      reporter: {
        name: itemData.reporterName,
        email: itemData.reporterEmail,
      },
    }

    const docRef = await addDoc(collection(db, "items"), item)
    return { id: docRef.id, ...item }
  } catch (error: any) {
    throw new Error(`Failed to create item: ${error.message}`)
  }
}

export const getItems = async (filters?: {
  type?: "lost" | "found"
  category?: string
  searchTerm?: string
  limitCount?: number
}) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    console.log("Fetching items from Firestore")

    // Build query with proper ordering (now that indexes are created)
    let q = query(collection(db, "items"), orderBy("createdAt", "desc"))

    if (filters?.type) {
      q = query(collection(db, "items"), where("type", "==", filters.type), orderBy("createdAt", "desc"))
    }

    if (filters?.category && filters.category !== "all") {
      if (filters.type) {
        // If both type and category filters are applied
        q = query(
          collection(db, "items"),
          where("type", "==", filters.type),
          where("category", "==", filters.category),
          orderBy("createdAt", "desc"),
        )
      } else {
        // If only category filter is applied
        q = query(collection(db, "items"), where("category", "==", filters.category), orderBy("createdAt", "desc"))
      }
    }

    if (filters?.limitCount) {
      q = query(q, limit(filters.limitCount))
    }

    const querySnapshot = await getDocs(q)
    const items: Item[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const item = {
        id: doc.id,
        ...data,
        reporter: data.reporter || {
          name: data.reporterName || "Unknown User",
          email: data.reporterEmail || "",
        },
        claims: data.claims || 0,
      } as Item
      items.push(item)
    })

    console.log(`Fetched ${items.length} items`)

    // Client-side search filtering (since search can't be efficiently done server-side)
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower),
      )
    }

    return items
  } catch (error: any) {
    console.error("Error fetching items:", error)
    throw new Error(`Failed to fetch items: ${error.message}`)
  }
}

export const getItem = async (id: string): Promise<Item | null> => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const docRef = doc(db, "items", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        reporter: data.reporter || {
          name: data.reporterName || "Unknown User",
          email: data.reporterEmail || "",
        },
        claims: data.claims || 0,
      } as Item
    }

    return null
  } catch (error) {
    console.error("Error getting item:", error)
    return null
  }
}

export const updateItemStatus = async (id: string, status: Item["status"]) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  if (!id) {
    throw new Error("Item ID is required")
  }

  try {
    console.log(`Updating item ${id} status to ${status}`)
    const docRef = doc(db, "items", id)

    // Check if item exists first
    const itemSnap = await getDoc(docRef)
    if (!itemSnap.exists()) {
      throw new Error("Item not found")
    }

    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    })
    console.log(`Item ${id} status updated to ${status}`)
  } catch (error: any) {
    console.error("Error updating item status:", error)
    throw new Error(error.message)
  }
}

export const deleteItem = async (id: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  if (!id) {
    throw new Error("Item ID is required")
  }

  try {
    console.log("Deleting item from Firestore:", id)
    const itemRef = doc(db, "items", id)

    // Check if item exists first
    const itemSnap = await getDoc(itemRef)
    if (!itemSnap.exists()) {
      throw new Error("Item not found")
    }

    await deleteDoc(itemRef)
    console.log("Item deleted successfully:", id)
  } catch (error: any) {
    console.error("Error deleting item:", error)
    throw new Error(`Failed to delete item: ${error.message}`)
  }
}

export const getUserItems = async (userId: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    // Now we can use both where and orderBy since the index exists
    const q = query(collection(db, "items"), where("reporterId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const items: Item[] = []

    querySnapshot.forEach((doc) => {
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

    return items
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const createClaim = async (claimData: Omit<Claim, "id" | "createdAt" | "date">) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const claim: Omit<Claim, "id"> = {
      ...claimData,
      createdAt: Timestamp.now(),
      date: new Date().toLocaleDateString(),
    }

    const docRef = await addDoc(collection(db, "claims"), claim)

    // Update item claims count
    const itemRef = doc(db, "items", claimData.itemId)
    const itemSnap = await getDoc(itemRef)
    if (itemSnap.exists()) {
      const currentClaims = itemSnap.data().claims || 0
      await updateDoc(itemRef, {
        claims: currentClaims + 1,
        updatedAt: Timestamp.now(),
      })
    }

    return { id: docRef.id, ...claim }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getItemClaims = async (itemId: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const q = query(collection(db, "claims"), where("itemId", "==", itemId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const claims: Claim[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      claims.push({
        id: doc.id,
        ...data,
        date: data.date || new Date(data.createdAt.seconds * 1000).toLocaleDateString(),
      } as Claim)
    })

    return claims
  } catch (error: any) {
    console.error("Error fetching claims:", error)
    throw new Error(error.message)
  }
}
