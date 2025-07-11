const CLOUDINARY_CLOUD_NAME = "ds89f1cln"
const UPLOAD_PRESET = "campus_find"

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw error
  }
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export const optimizeImageUrl = (url: string, width = 400, height = 300) => {
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`)
  }
  return url
}

export const isCloudinaryConfigured = () => true
