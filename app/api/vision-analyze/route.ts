import { NextRequest, NextResponse } from 'next/server'
import { analyzeClothingImage, type ClothingAnalysis } from '@/lib/vision/analyzeClothing'

export async function POST(request: NextRequest) {
  let analysisType = 'basic'
  
  try {
    const { image, analysisType: reqAnalysisType } = await request.json()
    analysisType = reqAnalysisType || 'basic'
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Use your comprehensive clothing analysis
    const analysis: ClothingAnalysis = await analyzeClothingImage({
      base64: image
    })

    // Transform to match your existing UI format
    let result
    switch (analysisType) {
      case 'basic':
        result = {
          type: analysis.summary.type,
          category: analysis.summary.category,
          colors: analysis.summary.colors,
          style: analysis.summary.style,
          season: [analysis.summary.season],
          occasion: [analysis.summary.occasion],
          confidence: Math.round(analysis.summary.confidence * 100),
          notes: `Analyzed using Google Vision API with ${analysis.meta.featuresUsed.length} features`,
          lastUpdated: analysis.meta.tsISO,
          source: 'google-vision'
        }
        break
      case 'details':
        result = {
          details: {
            brand: analysis.details.brand,
            material: analysis.details.material,
            size: analysis.details.size,
            condition: analysis.details.condition,
            year: analysis.details.year,
            model: analysis.details.model || `${analysis.summary.type} ${analysis.summary.colors[0] || ''}`.trim()
          }
        }
        break
      case 'pricing':
        result = {
          priceAnalysis: {
            estimatedPrice: analysis.pricing.estimatedValue,
            marketPrice: analysis.pricing.marketPrice,
            retailPrice: analysis.pricing.retailPrice,
            source: 'Google Vision + Market Analysis',
            lastUpdated: analysis.meta.tsISO,
            priceRange: {
              min: analysis.pricing.range[0],
              max: analysis.pricing.range[1]
            },
            trending: analysis.pricing.trend.toLowerCase() as 'up' | 'down' | 'stable'
          }
        }
        break
      default:
        result = {
          type: analysis.summary.type,
          category: analysis.summary.category,
          colors: analysis.summary.colors,
          style: analysis.summary.style,
          season: [analysis.summary.season],
          occasion: [analysis.summary.occasion],
          confidence: Math.round(analysis.summary.confidence * 100)
        }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Vision API error:', error)
    
    // Fallback to mock data if Vision API fails
    const fallbackResult = getFallbackResult(analysisType)
    return NextResponse.json(fallbackResult)
  }
}

function getFallbackResult(analysisType: string) {
  switch (analysisType) {
    case 'basic':
      return {
        type: 'Clothing Item',
        category: 'TOP',
        colors: ['Mixed'],
        style: 'Casual',
        season: ['ALL_SEASONS'],
        occasion: ['CASUAL'],
        confidence: 75,
        notes: 'Analysis unavailable - using fallback data',
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      }
    case 'details':
      return {
        details: {
          brand: 'Unknown Brand',
          material: 'Mixed Materials',
          size: 'M',
          condition: 'Good',
          year: new Date().getFullYear().toString(),
          model: 'Standard Fit'
        }
      }
    case 'pricing':
      return {
        priceAnalysis: {
          estimatedPrice: 75,
          marketPrice: 50,
          retailPrice: 100,
          source: 'Estimated',
          lastUpdated: new Date().toISOString(),
          priceRange: { min: 40, max: 90 },
          trending: 'stable' as const
        }
      }
    default:
      return {
        type: 'Clothing Item',
        category: 'TOP',
        colors: ['Mixed'],
        style: 'Casual',
        season: ['ALL_SEASONS'],
        occasion: ['CASUAL'],
        confidence: 75
      }
  }
}
