'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/lib/stores/ui'

export default function ThemeProvider() {
  const setTheme = useUIStore((state) => state.setTheme)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (isInitialized) return
    
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('drobe-theme') as 'dark' | 'light' | null
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    let initialTheme: 'dark' | 'light'
    
    if (savedTheme) {
      initialTheme = savedTheme
    } else {
      initialTheme = systemPrefersDark ? 'dark' : 'light'
    }
    
    // Apply theme to document and store
    setTheme(initialTheme)
    setIsInitialized(true)
  }, [setTheme, isInitialized])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('drobe-theme')
      // Only auto-switch if user hasn't set a preference
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [setTheme])

  return null
}
