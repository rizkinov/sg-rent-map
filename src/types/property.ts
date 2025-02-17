export type PropertyType = 'Condo' | 'HDB' | 'Landed'

export interface Property {
  id: string
  property_name: string
  property_type: PropertyType
  district: number | null
  rental_price: number
  beds: number
  baths: number | null
  sqft: number
  mrt: string | null
  latitude: number
  longitude: number
  completion_year: number | null
  url: string
  created_at: string
  street_name?: string
  lease_date?: string
}

export interface FilterParams {
  district_ids: number[]
  property_type: string[]
  beds: number[]
  sqft_min?: number
  sqft_max?: number
}