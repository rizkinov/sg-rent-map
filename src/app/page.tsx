'use client'

import { useState, useEffect } from 'react'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Map } from '@/components/map/Map'
import type { FilterParams } from '@/types/property'
import { useProperties } from '@/hooks/useProperties'
import { LoadingStatus } from '@/components/LoadingStatus'

export default function Home() {
  const [filters, setFilters] = useState<FilterParams>({
    district_ids: [],
    property_type: [],
    beds: []
  })

  const { 
    properties,
    isLoading,
    loadMore,
    hasMore,
    isFetchingMore,
    loadingStatus
  } = useProperties(filters)

  useEffect(() => {
    console.log('Properties count:', properties.length)
  }, [properties])

  // Implement infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        !isFetchingMore && 
        hasMore &&
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore, hasMore, isFetchingMore])

  if (isLoading && properties.length === 0) return null

  return (
    <main className="relative h-screen">
      {/* Filter Panel */}
      <div className="absolute top-0 left-0 w-[380px] h-full z-10">
        <FilterPanel 
          filters={filters}
          onChange={setFilters}
          properties={properties}
        />
      </div>
      
      {/* Map with offset */}
      <div className="absolute top-0 right-0 h-full" style={{ left: '380px' }}>
        <Map 
          properties={properties}
          selectedDistricts={filters.district_ids || []}
        />
      </div>

      {(isLoading || isFetchingMore) && <LoadingStatus 
        loaded={loadingStatus.loaded}
        total={loadingStatus.total}
      />}
    </main>
  )
} 