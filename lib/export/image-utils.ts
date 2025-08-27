import html2canvas from 'html2canvas'

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp'
  quality: number // 0-1 for jpeg/webp
  width?: number
  height?: number
  backgroundColor?: string
}

export interface SocialShareOptions {
  platform: 'twitter' | 'facebook' | 'instagram' | 'pinterest' | 'linkedin'
  text?: string
  url?: string
  hashtags?: string[]
}

// Download image from canvas element
export async function downloadImage(
  element: HTMLElement,
  filename: string,
  options: Partial<ExportOptions> = {}
): Promise<void> {
  const defaultOptions: ExportOptions = {
    format: 'png',
    quality: 0.95,
    backgroundColor: '#ffffff',
    ...options
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: defaultOptions.backgroundColor,
      width: defaultOptions.width,
      height: defaultOptions.height,
      scale: 2, // High DPI for better quality
      useCORS: true,
      allowTaint: true,
      logging: false
    })

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        `image/${defaultOptions.format}`,
        defaultOptions.quality
      )
    })

    // Download the image
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.${defaultOptions.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading image:', error)
    throw new Error('Failed to download image')
  }
}

// Save image to device photos (mobile)
export async function saveToDevice(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<void> {
  const defaultOptions: ExportOptions = {
    format: 'png',
    quality: 0.95,
    backgroundColor: '#ffffff',
    ...options
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: defaultOptions.backgroundColor,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    })

    // For mobile devices, try to use the native share API
    if (navigator.share && 'canShare' in navigator) {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          `image/${defaultOptions.format}`,
          defaultOptions.quality
        )
      })

      const file = new File([blob], `drobe-outfit.${defaultOptions.format}`, {
        type: `image/${defaultOptions.format}`
      })

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Drobe Outfit',
          text: 'Check out my outfit from Drobe!'
        })
        return
      }
    }

    // Fallback to download
    await downloadImage(element, 'drobe-outfit', options)
  } catch (error) {
    console.error('Error saving to device:', error)
    throw new Error('Failed to save image to device')
  }
}

// Share to social media
export function shareToSocial(
  imageDataUrl: string,
  platform: SocialShareOptions['platform'],
  options: Partial<SocialShareOptions> = {}
): void {
  const baseUrl = window.location.origin
  const defaultText = 'Check out my outfit from Drobe!'
  
  const shareOptions: SocialShareOptions = {
    text: defaultText,
    url: baseUrl,
    hashtags: ['drobe', 'outfit', 'fashion'],
    ...options,
    platform
  }

  let shareUrl = ''

  switch (platform) {
    case 'twitter':
      const hashtags = shareOptions.hashtags?.map(tag => `#${tag}`).join(' ') || ''
      const twitterText = encodeURIComponent(`${shareOptions.text} ${hashtags}`)
      shareUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareOptions.url || baseUrl)}`
      break

    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareOptions.url || baseUrl)}&quote=${encodeURIComponent(shareOptions.text || defaultText)}`
      break

    case 'pinterest':
      shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareOptions.url || baseUrl)}&media=${encodeURIComponent(imageDataUrl)}&description=${encodeURIComponent(shareOptions.text || defaultText)}`
      break

    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareOptions.url || baseUrl)}`
      break

    case 'instagram':
      // Instagram doesn't support direct web sharing, show instructions
      copyToClipboard(shareOptions.text || defaultText)
      alert('Text copied to clipboard! Open Instagram and paste in your story or post.')
      return

    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  // Open share URL in new window
  window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
}

// Generate outfit card for sharing
export async function generateOutfitCard(
  outfitData: {
    name: string
    items: Array<{
      name: string
      image: string
      category: string
    }>
    occasion?: string
    season?: string
  },
  theme: 'light' | 'dark' = 'dark'
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    // Set canvas size for social media optimal dimensions
    canvas.width = 1200
    canvas.height = 630
    
    // Theme colors
    const colors = theme === 'dark' ? {
      background: '#0b0b0d',
      panel: '#121216',
      text: '#f5f7fb',
      accent: '#22c55e',
      muted: '#7c7e87'
    } : {
      background: '#ffffff',
      panel: '#f8f9fa',
      text: '#1a1a1a',
      accent: '#22c55e',
      muted: '#6b7280'
    }
    
    // Background
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Header
    ctx.fillStyle = colors.panel
    ctx.fillRect(0, 0, canvas.width, 120)
    
    // Drobe logo/title
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 48px Inter, sans-serif'
    ctx.fillText('Drobe', 50, 75)
    
    // Outfit name
    ctx.fillStyle = colors.text
    ctx.font = 'bold 36px Inter, sans-serif'
    ctx.fillText(outfitData.name, 50, 200)
    
    // Occasion and season
    if (outfitData.occasion || outfitData.season) {
      ctx.fillStyle = colors.muted
      ctx.font = '24px Inter, sans-serif'
      const details = [outfitData.occasion, outfitData.season].filter(Boolean).join(' • ')
      ctx.fillText(details, 50, 240)
    }
    
    // Items grid (simplified for now - in real implementation you'd load and draw actual images)
    const itemsPerRow = 3
    const itemSize = 150
    const startX = 50
    const startY = 300
    const gap = 20
    
    outfitData.items.slice(0, 6).forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow)
      const col = index % itemsPerRow
      const x = startX + col * (itemSize + gap)
      const y = startY + row * (itemSize + gap)
      
      // Item placeholder (in real implementation, load actual images)
      ctx.fillStyle = colors.panel
      ctx.fillRect(x, y, itemSize, itemSize)
      
      // Item category label
      ctx.fillStyle = colors.text
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText(item.category, x + 10, y + itemSize - 10)
    })
    
    // QR code or URL (placeholder)
    ctx.fillStyle = colors.muted
    ctx.font = '20px Inter, sans-serif'
    ctx.fillText('Create your outfits at drobe.app', canvas.width - 400, canvas.height - 50)
    
    resolve(canvas.toDataURL('image/png'))
  })
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Export outfit data as JSON
export function exportOutfitData(outfitData: any): void {
  const jsonString = JSON.stringify(outfitData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${outfitData.name || 'outfit'}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}






