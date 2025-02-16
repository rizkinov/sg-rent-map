import { getSupabaseClient } from '@/lib/supabase/client'
import type { Property, FilterParams } from '@/types/property'
import { districtData } from '@/data/districts/singapore-districts'

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

  // Filter by district using the center point method
  if (filters?.district_ids?.length) {
    return data.filter(property => {
      return filters.district_ids!.some(districtId => {
        const district = districtData.find(d => d.id === districtId)
        if (!district) return false

        // Use a simple radius check around the district center
        const latDiff = Math.abs(district.center.lat - property.latitude)
        const lngDiff = Math.abs(district.center.lng - property.longitude)
        
        // Approximately 2km radius (0.02 degrees)
        return latDiff < 0.02 && lngDiff < 0.02
      })
    })
  }
  
  return data
} 