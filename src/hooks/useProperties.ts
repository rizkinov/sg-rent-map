import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getProperties, PaginatedResponse } from '@/lib/supabase/properties'
import type { Property, FilterParams } from '@/types/property'
import { useMemo } from 'react'

export function useProperties(filters: FilterParams) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['properties'] as const,
    queryFn: ({ pageParam }) => getProperties(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  // Combine all pages of properties
  const allProperties = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap(page => page.data)
  }, [data?.pages])

  // Filter properties
  const filteredProperties = useMemo(() => {
    return allProperties.filter(property => {
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
  }, [allProperties, filters])

  const total = data?.pages[0]?.total || 0

  return {
    properties: filteredProperties,
    isLoading,
    isFiltering: isLoading || allProperties.length === 0,
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    loadingStatus: {
      loaded: allProperties.length,
      total
    }
  }
} 