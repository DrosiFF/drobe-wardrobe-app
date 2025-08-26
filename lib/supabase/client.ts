import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createSafeSupabase() {
  const keysMissing = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url/' || supabaseAnonKey === 'your_supabase_anon_key'
  if (keysMissing) {
    console.warn('Supabase keys are missing. Running in guest mode without DB.')
    // Create a dummy client that throws on use to avoid runtime crashes in routes that require DB
    // but do not block client-rendered pages.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Proxy({}, {
      get() { throw new Error('Supabase is not configured') }
    }) as any
  }
  return createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

export const supabase = createSafeSupabase()

