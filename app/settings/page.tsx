'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  Moon, 
  Sun, 
  Bell, 
  Download, 
  Share2, 
  Database, 
  Eye,
  Palette,
  Smartphone,
  Globe,
  Lock,
  Trash2,
  Save,
  RotateCcw,
  Info
} from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui'
import { useToast } from '@/lib/stores/ui'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: any
}

export default function SettingsPage() {
  const { theme, setTheme, toggleTheme } = useUIStore()
  const { success, warning, info } = useToast()
  
  const [activeSection, setActiveSection] = useState('appearance')
  const [notifications, setNotifications] = useState({
    outfitReminders: true,
    newFeatures: true,
    weeklyDigest: false,
    socialSharing: true
  })
  
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    allowAnalytics: true,
    shareUsageData: false
  })

  const [exportSettings, setExportSettings] = useState({
    defaultFormat: 'png',
    quality: 0.95,
    includeMetadata: true,
    autoSave: false
  })

  const sections: SettingSection[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of Drobe',
      icon: Palette
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: Bell
    },
    {
      id: 'export',
      title: 'Export & Sharing',
      description: 'Configure export and social sharing options',
      icon: Share2
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      description: 'Control your privacy and data settings',
      icon: Lock
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Advanced settings and data management',
      icon: Database
    }
  ]

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('drobe-theme') as 'dark' | 'light'
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme)
    }
  }, [])

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('drobe-theme', theme)
  }, [theme])

  const handleSaveSettings = () => {
    // In a real app, you'd save to backend
    localStorage.setItem('drobe-notifications', JSON.stringify(notifications))
    localStorage.setItem('drobe-privacy', JSON.stringify(privacy))
    localStorage.setItem('drobe-export', JSON.stringify(exportSettings))
    
    success('Settings Saved', 'Your preferences have been updated')
  }

  const handleResetSettings = () => {
    setNotifications({
      outfitReminders: true,
      newFeatures: true,
      weeklyDigest: false,
      socialSharing: true
    })
    setPrivacy({
      profilePublic: false,
      allowAnalytics: true,
      shareUsageData: false
    })
    setExportSettings({
      defaultFormat: 'png',
      quality: 0.95,
      includeMetadata: true,
      autoSave: false
    })
    
    warning('Settings Reset', 'All settings have been reset to defaults')
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all app data? This action cannot be undone.')) {
      localStorage.clear()
      warning('Data Cleared', 'All local data has been removed')
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Theme Preference</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="p-3 bg-white rounded-lg border">
                    <Sun className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Light</p>
                    <p className="text-sm text-muted-foreground">Clean and bright</p>
                  </div>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="p-3 bg-gray-900 rounded-lg border">
                    <Moon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Dark</p>
                    <p className="text-sm text-muted-foreground">Easy on the eyes</p>
                  </div>
                </button>

                <button
                  onClick={() => setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 transition-all hover:scale-105"
                >
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-blue-600 rounded-lg">
                    <Monitor className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">System</p>
                    <p className="text-sm text-muted-foreground">Follow device</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Theme Changes</p>
                  <p className="text-sm text-muted-foreground">Theme changes are applied instantly</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Toggle Theme
              </button>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
            
            <div className="space-y-4">
              {Object.entries({
                outfitReminders: 'Outfit planning reminders',
                newFeatures: 'New feature announcements',
                weeklyDigest: 'Weekly wardrobe digest',
                socialSharing: 'Social sharing notifications'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'outfitReminders' && 'Get reminded to plan your outfits'}
                      {key === 'newFeatures' && 'Stay updated with new Drobe features'}
                      {key === 'weeklyDigest' && 'Weekly summary of your wardrobe activity'}
                      {key === 'socialSharing' && 'Notifications about social interactions'}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof prev]
                    }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[key as keyof typeof notifications] 
                        ? 'bg-primary' 
                        : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications[key as keyof typeof notifications] 
                          ? 'translate-x-6' 
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'export':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Export & Sharing Settings</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border">
                <label className="block font-medium text-foreground mb-2">Default Export Format</label>
                <select
                  value={exportSettings.defaultFormat}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, defaultFormat: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                >
                  <option value="png">PNG (High Quality)</option>
                  <option value="jpeg">JPEG (Smaller Size)</option>
                  <option value="webp">WebP (Modern)</option>
                </select>
              </div>

              <div className="p-4 bg-card rounded-lg border">
                <label className="block font-medium text-foreground mb-2">
                  Export Quality ({Math.round(exportSettings.quality * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={exportSettings.quality}
                  onChange={(e) => setExportSettings(prev => ({ 
                    ...prev, 
                    quality: parseFloat(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div>
                  <p className="font-medium text-foreground">Include Metadata</p>
                  <p className="text-sm text-muted-foreground">Include outfit details in exported images</p>
                </div>
                <button
                  onClick={() => setExportSettings(prev => ({ ...prev, includeMetadata: !prev.includeMetadata }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    exportSettings.includeMetadata ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      exportSettings.includeMetadata ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Privacy & Data Settings</h3>
            
            <div className="space-y-4">
              {Object.entries({
                profilePublic: 'Make profile public',
                allowAnalytics: 'Allow analytics',
                shareUsageData: 'Share usage data'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'profilePublic' && 'Allow others to see your profile and outfits'}
                      {key === 'allowAnalytics' && 'Help us improve Drobe with anonymous usage data'}
                      {key === 'shareUsageData' && 'Share data with partners to enhance features'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPrivacy(prev => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof prev]
                    }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacy[key as keyof typeof privacy] ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        privacy[key as keyof typeof privacy] ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'advanced':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Advanced Settings</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">Data Management</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your local data and preferences
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetSettings}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Settings
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>
              </div>

              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-medium text-foreground mb-2">App Version</h4>
                <p className="text-sm text-muted-foreground">
                  Drobe v1.0.0 - Latest
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Drobe experience
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:scale-[1.02] ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-card hover:bg-accent/50 text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium">{section.title}</p>
                      <p className={`text-xs ${
                        activeSection === section.id 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground'
                      }`}>
                        {section.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl border p-8"
            >
              {renderSection()}

              {/* Save Button */}
              {activeSection !== 'appearance' && activeSection !== 'advanced' && (
                <div className="flex justify-end mt-8 pt-6 border-t border-border">
                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}




