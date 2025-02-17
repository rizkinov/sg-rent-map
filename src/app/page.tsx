'use client'

import { useState } from 'react'
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
    isLoadingMore,
    loadingStatus
  } = useProperties(filters)

  if (isLoading) return null

  return (
    <main className="relative h-screen">
      <div className="absolute top-0 left-0 w-[380px] h-full z-10">
        <FilterPanel 
          filters={filters}
          onChange={setFilters}
          properties={properties}
        />
      </div>
      
      <div className="absolute top-0 right-0 h-full" style={{ left: '380px' }}>
        <Map 
          properties={properties}
          selectedDistricts={filters.district_ids || []}
        />
      </div>

      {(isLoading || isLoadingMore) && <LoadingStatus 
        loaded={loadingStatus.loaded}
        total={loadingStatus.total}
      />}
    </main>
  )
} 