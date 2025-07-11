"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, X, CheckCircle, AlertCircle } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  preview?: string | null
  disabled?: boolean
}

export default function ImageUpload({ onImageSelect, preview, disabled }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")

  const handleFileSelect = (file: File) => {
    setError("")

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }

    onImageSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const removeImage = () => {
    onImageSelect(null)
    setError("")
  }

  return (
    <div className="space-y-2">
      <Label>Photo (optional but recommended)</Label>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : preview
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-blue-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          id="image-upload"
          disabled={disabled}
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full h-32 object-cover rounded-lg mx-auto"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                  onClick={removeImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
              <p className="text-sm text-green-600">Image ready for upload</p>
              {!disabled && (
                <label htmlFor="image-upload" className="text-xs text-gray-500 cursor-pointer hover:text-blue-600">
                  Click to change image
                </label>
              )}
            </div>
          </div>
        ) : (
          <label htmlFor="image-upload" className={disabled ? "" : "cursor-pointer"}>
            <div className="space-y-2">
              {dragActive ? (
                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
              ) : (
                <Camera className="w-8 h-8 text-gray-400 mx-auto" />
              )}
              <p className="text-sm text-gray-600">
                {dragActive ? "Drop image here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}
