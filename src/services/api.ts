import { createClient } from '@supabase/supabase-js'
import type { Property, FilterParams } from '@/types/property'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function fetchProperties(filters: FilterParams = {}) {
  try {
    let query = supabase
      .from('properties')
      .select('*')

    // Apply filters
    if (filters.property_type?.length) {
      query = query.in('property_type', filters.property_type)
    }

    if (filters.bedrooms?.length) {
      query = query.in('bedrooms', filters.bedrooms)
    }

    if (filters.bathrooms?.length) {
      query = query.in('bathrooms', filters.bathrooms)
    }

    if (filters.sqft_min) {
      query = query.gte('sqft', filters.sqft_min)
    }

    if (filters.sqft_max) {
      query = query.lte('sqft', filters.sqft_max)
    }

    // For district filtering, we'll need to do it post-query since it's based on coordinates
    const { data, error } = await query

    if (error) {
      throw error
    }

    let properties = data as Property[]

    // Filter by district if specified
    if (filters.district_ids?.length) {
      properties = properties.filter(property => {
        return filters.district_ids!.some(id => {
          const district = districtData.find(d => d.id === id)
          if (!district) return false
          const latDiff = Math.abs(district.center.lat - property.latitude)
          const lngDiff = Math.abs(district.center.lng - property.longitude)
          return latDiff < 0.02 && lngDiff < 0.02
        })
      })
    }

    return properties
  } catch (error) {
    console.error('Error fetching properties:', error)
    throw error
  }
} 