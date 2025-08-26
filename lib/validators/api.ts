import { z } from 'zod'

// Base schemas
export const categorySchema = z.enum([
  'TOP',
  'BOTTOM', 
  'DRESS',
  'OUTERWEAR',
  'SHOES',
  'ACCESSORY'
])

export const seasonSchema = z.enum([
  'SPRING',
  'SUMMER', 
  'FALL',
  'WINTER',
  'ALL_SEASONS'
])

export const occasionSchema = z.enum([
  'CASUAL',
  'WORK',
  'FORMAL',
  'SPORTS',
  'PARTY',
  'TRAVEL'
])

export const conditionSchema = z.enum([
  'NEW',
  'LIKE_NEW',
  'GOOD',
  'FAIR',
  'POOR'
])

// API Request/Response schemas (AI analysis schemas removed)

export const itemCreateSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: categorySchema,
  subCategory: z.string().optional(),
  brand: z.string().optional(),
  material: z.string().optional(),
  size: z.string().optional(),
  colors: z.array(z.string()).min(1, 'At least one color is required'),
  seasons: z.array(seasonSchema).min(1, 'At least one season is required'),
  occasions: z.array(occasionSchema).min(1, 'At least one occasion is required'),
  condition: conditionSchema.default('GOOD'),
  images: z.array(z.string()).default([]),
  notes: z.string().optional(),
  estimatedPriceCents: z.number().min(0).optional(),
  userNotes: z.string().optional()
})

export const itemUpdateSchema = itemCreateSchema.partial().extend({
  id: z.string().min(1, 'Item ID is required')
})

export const outfitCreateSchema = z.object({
  name: z.string().min(1, 'Outfit name is required'),
  description: z.string().optional(),
  seasons: z.array(seasonSchema).min(1, 'At least one season is required'),
  occasions: z.array(occasionSchema).min(1, 'At least one occasion is required'),
  itemIds: z.array(z.string()).min(1, 'At least one item is required'),
  layout: z.record(z.any()).optional() // JSON for outfit builder layout
})

export const calendarPlanSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  time: z.string().optional(),
  outfitId: z.string().optional(),
  occasion: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  weather: z.string().optional(),
  temperature: z.number().optional()
})

export const purchaseCreateSchema = z.object({
  itemId: z.string().optional(),
  store: z.string().min(1, 'Store name is required'),
  priceCents: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  paymentMethod: z.string().optional(),
  purchasedAt: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  notes: z.string().optional()
})

// Error response schema
export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional()
})

// Type exports
export type Category = z.infer<typeof categorySchema>
export type Season = z.infer<typeof seasonSchema>
export type Occasion = z.infer<typeof occasionSchema>
export type Condition = z.infer<typeof conditionSchema>

export type ItemCreateRequest = z.infer<typeof itemCreateSchema>
export type ItemUpdateRequest = z.infer<typeof itemUpdateSchema>
export type OutfitCreateRequest = z.infer<typeof outfitCreateSchema>
export type CalendarPlanRequest = z.infer<typeof calendarPlanSchema>
export type PurchaseCreateRequest = z.infer<typeof purchaseCreateSchema>
export type ApiError = z.infer<typeof apiErrorSchema>



