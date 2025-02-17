// Define database table types
export interface PropertyRecord {
  id: string
  property_name: string
  property_type: 'Condo' | 'HDB' | 'Landed'
  district: number | null
  rental_price: number
  beds: number
  baths: number
  sqft: number
  latitude: number
  longitude: number
  street_name?: string
  lease_date?: string
  created_at: string
  updated_at: string
}

export interface DistrictRecord {
  id: number
  name: string
  region: string
  center_lat: number
  center_lng: number
  property_count: number
  avg_price: number
  condo_count: number
  hdb_count: number
  landed_count: number
  min_price: number
  max_price: number
  avg_size: number
} 