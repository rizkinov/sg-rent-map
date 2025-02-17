import { useQuery } from '@tanstack/react-query'
import { getProperties } from '@/lib/supabase/properties'
import type { Property, FilterParams } from '@/types/property'
import { useMemo } from 'react'

export function useProperties(filters: FilterParams) {
  // Fetch all properties once
  const { data: allProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['properties'],  // Remove filters from queryKey
    queryFn: () => getProperties(),  // Don't pass filters
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Filter properties client-side
  const filteredProperties = useMemo(() => {
    return allProperties.filter(property => {
      // Filter by district - handle null case
      if (filters.district_ids?.length > 0) {
        // If property has no district, filter it out when districts are selected
        if (!property.district) return false
        // Now TypeScript knows property.district is a number
        if (!filters.district_ids.includes(property.district)) {
          return false
        }
      }

      if (filters.property_type?.length > 0 && !filters.property_type.includes(property.property_type)) {
        return false
      }
      
      if (filters.beds?.length > 0) {
        if (!property.beds) return false
        
        if (filters.beds.includes(5)) {
          if (property.beds < 5) return false
        } else {
          if (!filters.beds.includes(property.beds)) return false
        }
      }

      if (filters.sqft_min && property.sqft < filters.sqft_min) {
        return false
      }

      if (filters.sqft_max && property.sqft > filters.sqft_max) {
        return false
      }

      return true
    })
  }, [allProperties, filters])

  return {
    data: filteredProperties,
    isLoading,
    isFiltering: isLoading || allProperties.length === 0
  }
} 