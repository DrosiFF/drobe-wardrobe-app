import { auth } from '@clerk/nextjs/server'

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth()
    return session?.userId ?? null
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}

export function getCurrentUserIdClient(): string | null {
  // This should only be used in client components
  // For server components, use getCurrentUserId()
  if (typeof window === 'undefined') {
    throw new Error('getCurrentUserIdClient can only be used in client components')
  }
  
  // We'll need to get this from the Clerk context in client components
  // This is just a placeholder - actual implementation will be in components
  return null
}
