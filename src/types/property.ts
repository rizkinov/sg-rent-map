export type PropertyType = 'Condo' | 'HDB' | 'Landed'

export interface Property extends Omit<PropertyRecord, 'property_type'> {
  property_type: PropertyType
}

export interface FilterParams {
  district_ids: number[]
  property_type: PropertyType[]
  beds: number[]
  sqft_min?: number
  sqft_max?: number
}

export interface DistrictSummary {
  property_count: number
  avg_price: number
  property_types: Record<PropertyType, number>
  price_range: {
    min: number
    max: number
  }
  avg_size: number
}

export interface District {
  id: number
  name: string
  region: string
  center: {
    lat: number
    lng: number
  }
  boundaries: [number, number][]
  summary: DistrictSummary
}