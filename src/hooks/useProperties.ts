import { useQuery } from '@tanstack/react-query'
import { fetchProperties } from '@/services/api'
import type { Property, FilterParams } from '@/types/property'

export function useProperties(filters: FilterParams) {
  return useQuery<Property[], Error>({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    keepPreviousData: true, // Keep showing old data while fetching new data
  })
} 