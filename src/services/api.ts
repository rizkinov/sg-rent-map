import { createClient } from '@supabase/supabase-js'
import type { Property, FilterParams } from '@/types/property'
import type { Database } from '@/types/database'
import type { District } from '@/types/district'
import { supabase } from '@/lib/supabase/client'

const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function fetchProperties(filters: FilterParams = {
  district_ids: [],
  property_type: [],
  beds: []
}): Promise<Property[]> {
  try {
    const { data, error } = await supabaseClient
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

export async function fetchDistricts(): Promise<District[]> {
  try {
    const { data, error } = await supabase
      .from('districts')
      .select(`
        id,
        name,
        region,
        center,
        boundaries,
        summary
      `)

    if (error) throw error

    return data.map(d => ({
      id: Number(d.id),
      name: String(d.name),
      region: String(d.region),
      center: {
        lat: Number(d.center.lat),
        lng: Number(d.center.lng)
      },
      boundaries: d.boundaries.map((coords: [number, number]) => [
        Number(coords[0]),
        Number(coords[1])
      ] as [number, number]),
      summary: {
        property_count: Number(d.summary.property_count),
        avg_price: Number(d.summary.avg_price),
        property_types: {
          Condo: Number(d.summary.property_types.Condo),
          HDB: Number(d.summary.property_types.HDB),
          Landed: Number(d.summary.property_types.Landed)
        },
        price_range: {
          min: Number(d.summary.price_range.min),
          max: Number(d.summary.price_range.max)
        },
        avg_size: Number(d.summary.avg_size)
      }
    }))
  } catch (error) {
    console.error('Error fetching districts:', error)
    throw error
  }
} 