'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Share2, 
  X, 
  Smartphone, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  Copy,
  FileImage,
  FileText,
  Settings
} from 'lucide-react'
import { useToast } from '@/lib/stores/ui'
import { 
  downloadImage, 
  saveToDevice, 
  shareToSocial, 
  exportOutfitData,
  copyToClipboard,
  ExportOptions 
} from '@/lib/export/image-utils'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  element: HTMLElement | null
  data: {
    name: string
    type: 'outfit' | 'item' | 'closet'
    metadata?: any
  }
}

export default function ExportModal({ isOpen, onClose, element, data }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'social' | 'data'>('image')
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<Partial<ExportOptions>>({
    format: 'png',
    quality: 0.95,
    backgroundColor: '#ffffff'
  })

  const { success, error } = useToast()

  const handleDownload = async () => {
    if (!element) {
      error('Export Error', 'No content to export')
      return
    }

    setIsExporting(true)
    try {
      await downloadImage(element, `drobe-${data.name}`, exportOptions)
      success('Downloaded!', 'Image saved to your downloads folder')
    } catch (err) {
      error('Download Failed', 'Could not download image')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSaveToDevice = async () => {
    if (!element) {
      error('Export Error', 'No content to export')
      return
    }

    setIsExporting(true)
    try {
      await saveToDevice(element, exportOptions)
      success('Saved!', 'Image saved to your device')
    } catch (err) {
      error('Save Failed', 'Could not save to device')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSocialShare = async (platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin') => {
    if (!element) {
      error('Export Error', 'No content to export')
      return
    }

    setIsExporting(true)
    try {
      // For social sharing, we'll generate a data URL first
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = element.offsetWidth * 2
      canvas.height = element.offsetHeight * 2
      
      // Simple implementation - in real use you'd use html2canvas
      const dataUrl = canvas.toDataURL('image/png')
      
      const shareText = `Check out my ${data.type} from Drobe! 🌟`
      shareToSocial(dataUrl, platform, { 
        text: shareText,
        hashtags: ['drobe', 'fashion', 'outfit', 'style']
      })
      
      success('Shared!', `Opened ${platform} for sharing`)
    } catch (err) {
      error('Share Failed', `Could not share to ${platform}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/share/${data.type}/${data.name}`
    try {
      await copyToClipboard(url)
      success('Copied!', 'Share link copied to clipboard')
    } catch (err) {
      error('Copy Failed', 'Could not copy link')
    }
  }

  const handleExportData = () => {
    try {
      exportOutfitData({
        name: data.name,
        type: data.type,
        exportedAt: new Date().toISOString(),
        metadata: data.metadata
      })
      success('Exported!', 'Data exported as JSON file')
    } catch (err) {
      error('Export Failed', 'Could not export data')
    }
  }

  const tabs = [
    { id: 'image', label: 'Image Export', icon: FileImage },
    { id: 'social', label: 'Social Share', icon: Share2 },
    { id: 'data', label: 'Data Export', icon: FileText }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-panel border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                Export {data.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {activeTab === 'image' && (
                <div className="space-y-6">
                  {/* Export Options */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Export Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Format
                        </label>
                        <select
                          value={exportOptions.format}
                          onChange={(e) => setExportOptions(prev => ({ 
                            ...prev, 
                            format: e.target.value as 'png' | 'jpeg' | 'webp' 
                          }))}
                          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                        >
                          <option value="png">PNG (High Quality)</option>
                          <option value="jpeg">JPEG (Smaller Size)</option>
                          <option value="webp">WebP (Modern)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Quality ({Math.round((exportOptions.quality || 0.95) * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={exportOptions.quality}
                          onChange={(e) => setExportOptions(prev => ({ 
                            ...prev, 
                            quality: parseFloat(e.target.value) 
                          }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Export Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleDownload}
                      disabled={isExporting}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {isExporting ? 'Downloading...' : 'Download'}
                    </button>

                    <button
                      onClick={handleSaveToDevice}
                      disabled={isExporting}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                    >
                      <Smartphone className="w-4 h-4" />
                      {isExporting ? 'Saving...' : 'Save to Device'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-foreground">Share on Social Media</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSocialShare('twitter')}
                      disabled={isExporting}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Twitter className="w-5 h-5" />
                      Twitter
                    </button>

                    <button
                      onClick={() => handleSocialShare('facebook')}
                      disabled={isExporting}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
                    >
                      <Facebook className="w-5 h-5" />
                      Facebook
                    </button>

                    <button
                      onClick={() => handleSocialShare('instagram')}
                      disabled={isExporting}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                    >
                      <Instagram className="w-5 h-5" />
                      Instagram
                    </button>

                    <button
                      onClick={() => handleSocialShare('linkedin')}
                      disabled={isExporting}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Share Link
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-foreground">Export Data</h3>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Export your {data.type} data as a JSON file for backup or analysis.
                    </p>

                    <button
                      onClick={handleExportData}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Export JSON Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}




