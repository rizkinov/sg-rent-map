import { createClient } from '@supabase/supabase-js'
import type { Property, FilterParams } from '@/types/property'
import districtData from '@/data/districts.json'
import type { District, DistrictResponse } from '@/types/district'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function fetchProperties(filters: FilterParams = {
  district_ids: [],
  property_type: [],
  beds: []
}) {
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
          const district = districtData.districts.find(d => d.id === id)
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

export async function fetchDistricts(filters: FilterParams = {}): Promise<District[]> {
  try {
    let query = supabase
      .from('districts')
      .select('*')
    
    const { data, error } = await query
    
    if (error) throw error
    
    let districts = data.map(d => ({
      id: d.id,
      name: d.name,
      region: d.region,
      center: {
        lat: d.center_lat,
        lng: d.center_lng
      },
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

    // Apply filters
    if (filters.property_type?.length) {
      districts = districts.filter(district => 
        filters.property_type!.some(type => 
          district.summary.property_types[type] > 0
        )
      )
    }

    if (filters.sqft_min) {
      districts = districts.filter(district => 
        district.summary.avg_size >= filters.sqft_min!
      )
    }

    if (filters.sqft_max) {
      districts = districts.filter(district => 
        district.summary.avg_size <= filters.sqft_max!
      )
    }

    return districts
  } catch (error) {
    console.error('Error fetching districts:', error)
    throw error
  }
} 