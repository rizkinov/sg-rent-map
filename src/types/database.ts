import type { PropertyRecord, DistrictRecord } from './supabase'

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: PropertyRecord
        Insert: Omit<PropertyRecord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PropertyRecord, 'id'>>
      }
      districts: {
        Row: DistrictRecord
        Insert: Omit<DistrictRecord, 'id'>
        Update: Partial<Omit<DistrictRecord, 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 