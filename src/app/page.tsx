'use client'

import { useState, useEffect } from 'react'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Map } from '@/components/map/Map'
import type { FilterParams } from '@/types/property'
import { useProperties } from '@/hooks/useProperties'

export default function Home() {
  const [filters, setFilters] = useState<FilterParams>({
    district_ids: [],
    property_type: [],
    beds: []
  })

  const { data: properties = [], isLoading, isFiltering } = useProperties(filters)

  useEffect(() => {
    console.log('Properties count:', properties.length)
  }, [properties])

  if (isLoading) return null

  return (
    <main className="relative h-screen">
      {/* Fixed position FilterPanel */}
      <div className="fixed top-0 left-0 h-full w-[380px] z-50 bg-background border-r">
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
    </main>
  )
} 