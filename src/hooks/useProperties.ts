import { useQuery } from '@tanstack/react-query'
import { getProperties, PaginatedResponse } from '@/lib/supabase/properties'
import type { Property, FilterParams } from '@/types/property'
import { useMemo } from 'react'

export function useProperties(filters: FilterParams) {
  // Fetch all properties once
  const { data, isLoading } = useQuery<PaginatedResponse<Property>>({
    queryKey: ['properties'],
    queryFn: () => getProperties(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  // Filter properties
  const filteredProperties = useMemo(() => {
    const properties = data?.data || []
    
    return properties.filter(property => {
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
  }, [data?.data, filters])

  return {
    data: filteredProperties,
    isLoading,
    isFiltering: isLoading || !data?.data.length,
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    currentPage: data?.currentPage || 0
  }
} 