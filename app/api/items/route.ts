import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { categorySchema, seasonSchema, occasionSchema } from '@/lib/validators/api'

// Query parameters schema for GET requests
const itemsQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  category: categorySchema.optional(),
  seasons: z.array(seasonSchema).optional(),
  occasions: z.array(occasionSchema).optional(),
  colors: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  search: z.string().optional()
})

// GET /api/items - Get all items for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryParams = {
      userId: searchParams.get('userId'),
      category: searchParams.get('category') || undefined,
      seasons: searchParams.getAll('seasons').filter(Boolean),
      occasions: searchParams.getAll('occasions').filter(Boolean),
      colors: searchParams.getAll('colors').filter(Boolean),
      brands: searchParams.getAll('brands').filter(Boolean),
      search: searchParams.get('search') || undefined
    }

    const validationResult = itemsQuerySchema.safeParse(queryParams)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { userId, ...filters } = validationResult.data

    // Clean up empty arrays
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => 
        value !== undefined && (!Array.isArray(value) || value.length > 0)
      )
    )

    // TODO: Use actual database service once properly implemented
    // For now, return empty list to keep UI functional
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch items',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// POST /api/items - Create a new item
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Service Unavailable', message: 'Items API is temporarily disabled.' },
    { status: 503 }
  )
}

// PUT /api/items - Update an item
export async function PUT(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Service Unavailable', message: 'Items API is temporarily disabled.' },
    { status: 503 }
  )
}

// DELETE /api/items - Delete an item
export async function DELETE(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Service Unavailable', message: 'Items API is temporarily disabled.' },
    { status: 503 }
  )
}