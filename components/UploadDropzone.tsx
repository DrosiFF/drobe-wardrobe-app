'use client'

import { useCallback, useState } from 'react'

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string
}

export default function UploadDropzone({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 10,
  accept = 'image/*'
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFiles = (files: File[]): { valid: File[], errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []

    files.forEach(file => {
      // Check file type
      if (accept === 'image/*' && !file.type.startsWith('image/')) {
        errors.push(`${file.name}: Only image files are allowed`)
        return
      }

      // Check file size (convert MB to bytes)
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than ${maxSize}MB`)
        return
      }

      valid.push(file)
    })

    // Check total file count
    if (valid.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`)
      return { valid: valid.slice(0, maxFiles), errors }
    }

    return { valid, errors }
  }

  const handleFiles = (files: File[]) => {
    setError(null)
    const { valid, errors } = validateFiles(files)
    
    if (errors.length > 0) {
      setError(errors[0])
      setTimeout(() => setError(null), 5000)
    }
    
    if (valid.length > 0) {
      onFilesSelected(valid)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragging 
            ? "border-blue-500 bg-blue-50 scale-105 shadow-lg" 
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-6xl mb-4">
          {isDragging ? '📤' : '📷'}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {isDragging ? 'Drop your photos here!' : 'Drag & drop your photos here'}
        </h3>
        <p className="text-gray-600 mb-4">
          or click to browse files
        </p>
        <p className="text-xs text-gray-500">
          Maximum {maxFiles} files, {maxSize}MB each
        </p>
      </div>

      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm animate-fade-in">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
