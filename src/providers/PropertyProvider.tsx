'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Property, FilterParams, PropertyType } from '@/types/property'
import { getProperties } from '@/lib/supabase/properties'

interface PropertyContextType {
  properties: Property[]
  filters: FilterParams
  setFilters: (filters: FilterParams) => void
  filteredProperties: Property[]
  loading: boolean
  loadMore: () => Promise<void>
  loadingStatus: {
    loaded: number
    total: number
  }
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalProperties, setTotalProperties] = useState(0)
  const [filters, setFilters] = useState<FilterParams>({
    district_ids: [],
    property_type: [],
    beds: [],
    sqft_min: undefined,
    sqft_max: undefined
  })

  const loadMore = async () => {
    if (!hasMore || loading) return

    setLoading(true)
    try {
      const response = await getProperties(currentPage)
      setProperties(prev => [...prev, ...response.data])
      setHasMore(response.hasMore)
      setTotalProperties(response.total)
      setCurrentPage(prev => prev + 1)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadMore()
  }, [])

  const filteredProperties = properties.filter(property => {
    if (filters.district_ids.length && !filters.district_ids.includes(property.district || 0)) {
      return false
    }
    if (filters.property_type.length && !filters.property_type.includes(property.property_type)) {
      return false
    }
    if (filters.beds.length && !filters.beds.includes(property.beds)) {
      return false
    }
    if (filters.sqft_min && property.sqft < filters.sqft_min) {
      return false
    }
    if (filters.sqft_max && property.sqft > filters.sqft_max) {
      return false
    }
    return true
  })

  return (
    <PropertyContext.Provider 
      value={{ 
        properties, 
        filters, 
        setFilters, 
        filteredProperties, 
        loading,
        loadMore,
        loadingStatus: {
          loaded: properties.length,
          total: totalProperties
        }
      }}
    >
      {children}
    </PropertyContext.Provider>
  )
}

export function useProperties() {
  const context = useContext(PropertyContext)
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider')
  }
  return context
} 