// Google Vision API Service
// Note: You'll need to install @google-cloud/vision manually
// Run: npm install @google-cloud/vision

export interface VisionAnalysis {
  type: string
  category: string
  colors: string[]
  style: string
  season: string[]
  occasion: string[]
  confidence: number
  brand?: string
  notes: string
  lastUpdated: string
  source: string
}

export class GoogleVisionService {
  private vision: any = null
  private isInitialized: boolean = false
  
  private async initializeVision() {
    if (this.isInitialized) return
    
    try {
      // Dynamic import for Next.js compatibility
      const { ImageAnnotatorClient } = await import('@google-cloud/vision')
      
      // Check if credentials are available
      const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_VISION_CREDENTIALS
      
      if (hasCredentials) {
        this.vision = new ImageAnnotatorClient()
        console.log('Google Vision service initialized successfully')
      } else {
        console.log('Google Vision credentials not found, using mock data')
      }
    } catch (error) {
      console.warn('Google Vision API not available, using mock data:', error instanceof Error ? error.message : String(error))
    }
    
    this.isInitialized = true
  }

  async analyzeImage(base64Image: string): Promise<VisionAnalysis> {
    await this.initializeVision()
    
    if (!this.vision) {
      // Return mock data until API is set up
      return this.getMockAnalysis()
    }

    try {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64')

      // Perform label detection
      const [labelResult] = await this.vision.labelDetection({
        image: { content: imageBuffer }
      })

      // Perform text detection (for brand identification)
      const [textResult] = await this.vision.textDetection({
        image: { content: imageBuffer }
      })

      // Perform object localization
      const [objectResult] = await this.vision.objectLocalization({
        image: { content: imageBuffer }
      })

      return this.processVisionResults(labelResult, textResult, objectResult)
    } catch (error) {
      console.error('Google Vision API error:', error)
      return this.getMockAnalysis()
    }
  }

  private processVisionResults(labelResult: any, textResult: any, objectResult: any): VisionAnalysis {
    const labels = labelResult.labelAnnotations || []
    const texts = textResult.textAnnotations || []
    const objects = objectResult.localizedObjectAnnotations || []

    // Extract clothing type from objects and labels
    const clothingObjects = objects.filter((obj: any) => 
      obj.name.toLowerCase().includes('clothing') ||
      obj.name.toLowerCase().includes('shirt') ||
      obj.name.toLowerCase().includes('pants') ||
      obj.name.toLowerCase().includes('dress') ||
      obj.name.toLowerCase().includes('shoe')
    )

    // Determine clothing type
    let type = 'Unknown Item'
    let category = 'TOP'

    if (clothingObjects.length > 0) {
      const mainObject = clothingObjects[0].name
      type = this.mapObjectToClothingType(mainObject)
      category = this.mapTypeToCategory(type)
    } else {
      // Fallback to labels
      const clothingLabels = labels.filter((label: any) =>
        ['clothing', 'shirt', 'pants', 'dress', 'footwear', 'jacket'].some(term =>
          label.description.toLowerCase().includes(term)
        )
      )
      if (clothingLabels.length > 0) {
        type = this.mapLabelToClothingType(clothingLabels[0].description)
        category = this.mapTypeToCategory(type)
      }
    }

    // Extract colors from labels
    const colorLabels = labels.filter((label: any) =>
      ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'pink', 'purple', 'orange', 'brown'].some(color =>
        label.description.toLowerCase().includes(color)
      )
    )
    const colors = colorLabels.slice(0, 3).map((label: any) => 
      this.extractColorFromLabel(label.description)
    )

    // Try to detect brand from text
    const brand = this.detectBrand(texts)

    // Determine style, season, and occasion based on type and labels
    const style = this.determineStyle(labels, type)
    const season = this.determineSeason(type, labels)
    const occasion = this.determineOccasion(type, labels)

    // Calculate confidence based on detection quality
    const confidence = Math.min(
      90,
      Math.max(60, Math.round(
        (labels.slice(0, 5).reduce((sum: number, label: any) => sum + label.score, 0) / 5) * 100
      ))
    )

    return {
      type,
      category,
      colors: colors.length > 0 ? colors : ['Unknown'],
      style,
      season,
      occasion,
      confidence,
      brand,
      notes: `Detected using Google Vision API. ${objects.length} objects and ${labels.length} labels found.`,
      lastUpdated: new Date().toISOString(),
      source: 'google-vision'
    }
  }

  private mapObjectToClothingType(objectName: string): string {
    const name = objectName.toLowerCase()
    if (name.includes('shirt')) return 'Shirt'
    if (name.includes('pants')) return 'Pants'
    if (name.includes('dress')) return 'Dress'
    if (name.includes('shoe')) return 'Shoes'
    if (name.includes('jacket')) return 'Jacket'
    return 'Clothing Item'
  }

  private mapLabelToClothingType(labelDescription: string): string {
    const desc = labelDescription.toLowerCase()
    if (desc.includes('shirt')) return 'Shirt'
    if (desc.includes('pants') || desc.includes('trousers')) return 'Pants'
    if (desc.includes('dress')) return 'Dress'
    if (desc.includes('footwear') || desc.includes('shoe')) return 'Shoes'
    if (desc.includes('jacket') || desc.includes('coat')) return 'Jacket'
    if (desc.includes('jeans')) return 'Jeans'
    return 'Clothing Item'
  }

  private mapTypeToCategory(type: string): string {
    const lowerType = type.toLowerCase()
    if (['shirt', 'blouse', 't-shirt', 'tank top'].some(t => lowerType.includes(t))) return 'TOP'
    if (['pants', 'jeans', 'shorts', 'skirt'].some(t => lowerType.includes(t))) return 'BOTTOM'
    if (lowerType.includes('dress')) return 'DRESS'
    if (['jacket', 'coat', 'blazer', 'hoodie'].some(t => lowerType.includes(t))) return 'OUTERWEAR'
    if (['shoes', 'sneakers', 'boots', 'sandals'].some(t => lowerType.includes(t))) return 'SHOES'
    return 'TOP' // default
  }

  private extractColorFromLabel(description: string): string {
    const desc = description.toLowerCase()
    if (desc.includes('red')) return 'Red'
    if (desc.includes('blue')) return 'Blue'
    if (desc.includes('green')) return 'Green'
    if (desc.includes('yellow')) return 'Yellow'
    if (desc.includes('black')) return 'Black'
    if (desc.includes('white')) return 'White'
    if (desc.includes('gray') || desc.includes('grey')) return 'Gray'
    if (desc.includes('pink')) return 'Pink'
    if (desc.includes('purple')) return 'Purple'
    if (desc.includes('orange')) return 'Orange'
    if (desc.includes('brown')) return 'Brown'
    return description // return original if no specific color found
  }

  private detectBrand(texts: any[]): string | undefined {
    const commonBrands = [
      'nike', 'adidas', 'zara', 'h&m', 'uniqlo', 'gap', 'levi', 'calvin klein',
      'ralph lauren', 'tommy hilfiger', 'lacoste', 'polo', 'gucci', 'prada'
    ]

    for (const text of texts) {
      const description = text.description.toLowerCase()
      for (const brand of commonBrands) {
        if (description.includes(brand)) {
          return brand.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        }
      }
    }
    return undefined
  }

  private determineStyle(labels: any[], type: string): string {
    const labelTexts = labels.map((l: any) => l.description.toLowerCase()).join(' ')
    
    if (labelTexts.includes('formal') || labelTexts.includes('business') || labelTexts.includes('suit')) {
      return 'Formal'
    }
    if (labelTexts.includes('casual') || labelTexts.includes('everyday')) {
      return 'Casual'
    }
    if (labelTexts.includes('sport') || labelTexts.includes('athletic')) {
      return 'Sporty'
    }
    if (labelTexts.includes('vintage') || labelTexts.includes('retro')) {
      return 'Vintage'
    }
    
    return 'Casual' // default
  }

  private determineSeason(type: string, labels: any[]): string[] {
    const labelTexts = labels.map((l: any) => l.description.toLowerCase()).join(' ')
    
    if (type.toLowerCase().includes('jacket') || type.toLowerCase().includes('coat')) {
      return ['FALL', 'WINTER']
    }
    if (type.toLowerCase().includes('shorts') || type.toLowerCase().includes('tank')) {
      return ['SPRING', 'SUMMER']
    }
    if (labelTexts.includes('heavy') || labelTexts.includes('wool')) {
      return ['FALL', 'WINTER']
    }
    if (labelTexts.includes('light') || labelTexts.includes('thin')) {
      return ['SPRING', 'SUMMER']
    }
    
    return ['ALL_SEASONS']
  }

  private determineOccasion(type: string, labels: any[]): string[] {
    const labelTexts = labels.map((l: any) => l.description.toLowerCase()).join(' ')
    
    if (labelTexts.includes('formal') || labelTexts.includes('business') || labelTexts.includes('suit')) {
      return ['WORK', 'FORMAL']
    }
    if (labelTexts.includes('sport') || labelTexts.includes('athletic')) {
      return ['SPORTS']
    }
    if (labelTexts.includes('party') || labelTexts.includes('evening')) {
      return ['PARTY']
    }
    
    return ['CASUAL']
  }

  private getMockAnalysis(): VisionAnalysis {
    return {
      type: 'Clothing Item',
      category: 'TOP',
      colors: ['Unknown'],
      style: 'Casual',
      season: ['ALL_SEASONS'],
      occasion: ['CASUAL'],
      confidence: 0,
      brand: undefined,
      notes: 'Google Vision API not configured yet. Please complete setup.',
      lastUpdated: new Date().toISOString(),
      source: 'mock'
    }
  }
}

// Export singleton instance
export const googleVisionService = new GoogleVisionService()
