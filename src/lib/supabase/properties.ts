import { ApiError } from '@/types/api'
import { supabase } from '@/lib/supabase/client'
import type { Property } from '@/types/property'
import type { Database } from '@/types/database'

const PAGE_SIZE = 100 // Adjust based on your needs

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  hasMore: boolean
  currentPage: number
}

export async function getProperties(page = 0): Promise<PaginatedResponse<Property>> {
  try {
    // First get the total count
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })

    // Then get the paginated data
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      .order('created_at', { ascending: false })

    if (error) {
      throw new ApiError(error.message, 500)
    }

    if (!data) {
      throw new ApiError('No data returned', 404)
    }

    return {
      data,
      total: count || 0,
      hasMore: (page + 1) * PAGE_SIZE < (count || 0),
      currentPage: page
    }
  } catch (error) {
    console.error('Error in getProperties:', error)
    throw error instanceof ApiError ? error : new ApiError('Failed to fetch properties')
  }
} 