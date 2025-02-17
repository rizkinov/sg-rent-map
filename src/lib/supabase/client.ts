import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { ApiError } from '@/types/api'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function createClient() {
  try {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw new ApiError('Database connection failed', 500)
  }
}

// For browser usage
export const supabase = createClient()

export function getSupabaseClient() {
  return supabase
}