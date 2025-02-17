import { ApiError } from '@/types/api'
import { supabase } from '@/lib/supabase/client'
import type { Property } from '@/types/property'
import type { Database } from '@/types/database'

const PAGE_SIZE = 1000

export async function getProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')

    if (error) {
      throw new ApiError(error.message, 500)
    }

    if (!data) {
      throw new ApiError('No data returned', 404)
    }

    return data
  } catch (error) {
    console.error('Error in getProperties:', error)
    throw error instanceof ApiError ? error : new ApiError('Failed to fetch properties')
  }
} 