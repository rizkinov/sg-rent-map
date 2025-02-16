export type PropertyType = 'Condo' | 'HDB' | 'Landed'

export interface Property {
  id: string
  property_type: PropertyType
  sqft: number
  bedrooms: number
  bathrooms: number
  rental_price: number
  latitude: number
  longitude: number
  created_at: string
  district_id: number
}

export interface FilterParams {
  property_type?: PropertyType[]
  sqft_min?: number
  sqft_max?: number
  bedrooms?: number[]
  bathrooms?: number[]
  district_ids?: number[]
}