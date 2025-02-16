import { getSupabaseClient } from '@/lib/supabase/client'
import type { Property, FilterParams } from '@/types/property'

export async function getProperties(filters?: FilterParams): Promise<Property[]> {
  const supabase = getSupabaseClient(false)
  
  let query = supabase
    .from('properties')
    .select('*')
  
  if (filters) {
    if (filters.property_type?.length > 0) {
      query = query.in('property_type', filters.property_type)
    }
    
    if (filters.sqft_min) {
      query = query.gte('sqft', filters.sqft_min)
    }
    
    if (filters.sqft_max) {
      query = query.lte('sqft', filters.sqft_max)
    }
    
    if (filters.bedrooms?.length > 0) {
      query = query.in('bedrooms', filters.bedrooms)
    }
    
    if (filters.bathrooms?.length > 0) {
      query = query.in('bathrooms', filters.bathrooms)
    }
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching properties:', error)
    throw error
  }
  
  return data
} 