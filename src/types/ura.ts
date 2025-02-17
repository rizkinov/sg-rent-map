import type { PropertyType } from './property'

export interface URARentalRecord {
  // Required fields from URA API
  project_name: string
  street: string
  postal_district: string
  property_type: PropertyType
  floor_area: number
  sqft: number
  bedrooms: number
  bathrooms: number
  rental_price: number
  lease_date: string
  latitude: number
  longitude: number
  created_at: string
}

export interface URAToken {
  access_token: string
  token_type: string
  expires_in: number
  status: string
}

export interface URAError {
  status: string
  message: string
} 