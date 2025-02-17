import { createClient } from '@supabase/supabase-js'
import type { Property, FilterParams, PropertyType, District } from '@/types/property'
import type { Database } from '@/types/database'
import { districtBoundaries } from '@/data/districts/boundaries'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function fetchProperties(filters: FilterParams = {
  district_ids: [],
  property_type: [],
  beds: []
}): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('property_type', filters.property_type)
      .in('beds', filters.beds)
      .gte('sqft', filters.sqft_min || 0)
      .lte('sqft', filters.sqft_max || Number.MAX_VALUE)

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching properties:', error)
    throw error
  }
}

export async function fetchDistricts(filters: FilterParams = {
  district_ids: [],
  property_type: [],
  beds: []
}): Promise<District[]> {
  try {
    const { data, error } = await supabase
      .from('districts')
      .select('*')

    if (error) throw error

    const districts: District[] = data.map(d => ({
      id: d.id,
      name: d.name,
      region: d.region,
      center: {
        lat: d.center_lat,
        lng: d.center_lng
      },
      boundaries: districtBoundaries[d.id as keyof typeof districtBoundaries] || [],
      summary: {
        property_count: d.property_count,
        avg_price: d.avg_price,
        property_types: {
          Condo: d.condo_count,
          HDB: d.hdb_count,
          Landed: d.landed_count
        },
        price_range: {
          min: d.min_price,
          max: d.max_price
        },
        avg_size: d.avg_size
      }
    }))

    return districts
  } catch (error) {
    console.error('Error fetching districts:', error)
    throw error
  }
} 