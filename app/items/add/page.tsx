'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Camera, 
  X,
  Check,
  Upload,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TopBar from '@/components/TopBar'
import { useUser } from '@clerk/nextjs'
import { ItemsService } from '@/lib/supabase/items'

interface FormData {
  name: string
  category: string
  brand: string
  color: string
  fabric: string
  season: string
  occasion: string
  price: string
  tags: string
}

const categories = [
  { value: 'TOP', label: 'Top' },
  { value: 'BOTTOM', label: 'Bottom' },
  { value: 'DRESS', label: 'Dress' },
  { value: 'OUTERWEAR', label: 'Outerwear' },
  { value: 'SHOES', label: 'Shoes' },
  { value: 'ACCESSORY', label: 'Accessory' },
  { value: 'BAG', label: 'Bag' },
  { value: 'HAT', label: 'Hat' },
  { value: 'OTHER', label: 'Other' }
]

const seasons = [
  { value: 'ALL', label: 'All Seasons' },
  { value: 'SPRING', label: 'Spring' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'FALL', label: 'Fall' },
  { value: 'WINTER', label: 'Winter' }
]

const occasions = [
  { value: 'CASUAL', label: 'Casual' },
  { value: 'WORK', label: 'Work' },
  { value: 'FORMAL', label: 'Formal' },
  { value: 'PARTY', label: 'Party' },
  { value: 'SPORT', label: 'Sport' },
  { value: 'BEACH', label: 'Beach' },
  { value: 'TRAVEL', label: 'Travel' }
]

export default function AddItemPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    brand: '',
    color: '',
    fabric: '',
    season: 'ALL',
    occasion: 'CASUAL',
    price: '',
    tags: ''
  })

  const itemsService = new ItemsService()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    
    setUploadedFiles(prev => [...prev, ...files])
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeFile = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(previewUrls[index])
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one image')
      return
    }

    if (!user) {
      alert('Please sign in to add items')
      return
    }

    setIsUploading(true)

    try {
      // For now, we'll use a placeholder image URL since we don't have image upload set up yet
      // In a real app, you'd upload the files to a storage service first
      const imageUrl = uploadedFiles.length > 0 ? URL.createObjectURL(uploadedFiles[0]) : '/placeholder-item.jpg'
      
      // Create the item data in the format expected by Supabase
      const itemData = {
        name: formData.name,
        image_url: imageUrl,
        category: formData.category as any, // Cast to match database enum
        brand: formData.brand || null,
        colors: formData.color ? [formData.color] : [],
        fabric: formData.fabric || null,
        seasons: formData.season ? [formData.season] : ['ALL'],
        occasions: formData.occasion ? [formData.occasion] : ['CASUAL'],
        price: formData.price ? parseFloat(formData.price) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        description: null,
        worn_count: 0,
        last_worn: null,
        notes: null,
        ai_analysis: null,
        wardrobe_id: null
      }

      // Save to database using the user's ID
      await itemsService.createItem(itemData, user.id)
      
      // Success - redirect to items page
      router.push('/items')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      
      <div className="content-container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="ghost-button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="display-text">Add New Item</h1>
              <p className="text-muted-foreground">Upload photos and details of your clothing item</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border/50"
            >
              <h2 className="section-title mb-6">Photos</h2>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors duration-200 bg-secondary/20">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary hover:text-primary/80">
                      Click to upload
                    </span>
                    {' '}or drag and drop
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB each</p>
                </label>
              </div>

              {/* Preview Section */}
              {previewUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-6"
                >
                  <h3 className="text-sm font-medium text-foreground mb-3">Uploaded Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className="relative group"
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Item Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
              className="bg-card rounded-2xl p-6 border border-border/50"
            >
              <h2 className="section-title mb-6">Item Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Item Name *
                  </label>
                  <Input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Navy Blue Blazer"
                    className="search-input"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-foreground">
                    Category *
                  </label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="search-input w-full"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <label htmlFor="brand" className="text-sm font-medium text-foreground">
                    Brand
                  </label>
                  <Input
                    type="text"
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="e.g., Zara, H&M, Nike"
                    className="search-input"
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label htmlFor="color" className="text-sm font-medium text-foreground">
                    Color
                  </label>
                  <Input
                    type="text"
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="e.g., Navy Blue, Red, Floral"
                    className="search-input"
                  />
                </div>

                {/* Fabric */}
                <div className="space-y-2">
                  <label htmlFor="fabric" className="text-sm font-medium text-foreground">
                    Fabric/Material
                  </label>
                  <Input
                    type="text"
                    id="fabric"
                    value={formData.fabric}
                    onChange={(e) => handleInputChange('fabric', e.target.value)}
                    placeholder="e.g., Cotton, Wool, Polyester"
                    className="search-input"
                  />
                </div>

                {/* Season */}
                <div className="space-y-2">
                  <label htmlFor="season" className="text-sm font-medium text-foreground">
                    Season
                  </label>
                  <select
                    id="season"
                    value={formData.season}
                    onChange={(e) => handleInputChange('season', e.target.value)}
                    className="search-input w-full"
                  >
                    {seasons.map(season => (
                      <option key={season.value} value={season.value}>{season.label}</option>
                    ))}
                  </select>
                </div>

                {/* Occasion */}
                <div className="space-y-2">
                  <label htmlFor="occasion" className="text-sm font-medium text-foreground">
                    Occasion
                  </label>
                  <select
                    id="occasion"
                    value={formData.occasion}
                    onChange={(e) => handleInputChange('occasion', e.target.value)}
                    className="search-input w-full"
                  >
                    {occasions.map(occasion => (
                      <option key={occasion.value} value={occasion.value}>{occasion.label}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-foreground">
                    Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className="search-input"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium text-foreground">
                    Tags (comma-separated)
                  </label>
                  <Input
                    type="text"
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="e.g., casual, versatile, summer"
                    className="search-input"
                  />
                </div>
              </div>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
              className="flex justify-end gap-4"
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isUploading}
                className="ghost-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || uploadedFiles.length === 0}
                className="brand-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}