import { useQuery } from '@tanstack/react-query'
import { getProperties, PaginatedResponse } from '@/lib/supabase/properties'
import type { Property, FilterParams } from '@/types/property'
import { useMemo, useState, useEffect } from 'react'

export function useProperties(filters: FilterParams) {
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['properties', currentPage] as const,
    queryFn: () => getProperties(currentPage),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: hasMore
  })

  // Load next batch when current one is done
  useEffect(() => {
    if (data) {
      setAllProperties(prev => [...prev, ...data.data])
      setHasMore(data.hasMore)
      setTotalCount(data.total)
      if (data.hasMore) {
        setCurrentPage(prev => prev + 1)
      }
    }
  }, [data])

  // Filter properties
  const filteredProperties = useMemo(() => {
    return allProperties.filter(property => {
      // Check district filter - handle null district
      if (filters.district_ids.length) {
        const district = property.district || 0 // Default to 0 if null
        if (!filters.district_ids.includes(district)) {
          return false
        }
      }

      if (filters.property_type.length && !filters.property_type.includes(property.property_type)) {
        return false
      }

      if (filters.beds.length) {
        // Special handling for 5+ beds
        if (filters.beds.includes(5)) {
          // If beds is 5 or more, include it when 5 is selected
          if (property.beds >= 5) return true
          // Otherwise check other selected bed counts
          if (!filters.beds.includes(property.beds)) return false
        } else {
          // Normal bed filtering for 1-4 beds
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

  const isInitialLoading = isLoading && allProperties.length === 0

  return {
    properties: filteredProperties,
    isLoading: isInitialLoading,
    isLoadingMore: isFetching && !isInitialLoading,
    loadingStatus: {
      loaded: allProperties.length,
      total: totalCount
    }
  }
} 