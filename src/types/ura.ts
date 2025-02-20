import type { PropertyType } from './property'

export interface URARentalRecord {
  project_name: string
  property_type: PropertyType
  sqft: number
  bedrooms: number
  bathrooms: number
  rental_price: number
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