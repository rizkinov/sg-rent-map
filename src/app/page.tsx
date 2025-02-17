'use client'

import { useState, useEffect } from 'react'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Map } from '@/components/map/Map'
import type { FilterParams } from '@/types/property'
import { useProperties } from '@/providers/PropertyProvider'
import { LoadingStatus } from '@/components/LoadingStatus'

export default function Home() {
  const [filters, setFilters] = useState<FilterParams>({
    district_ids: [],
    property_type: [],
    beds: []
  })

  const { 
    properties, 
    loading, 
    filteredProperties, 
    loadingStatus, 
    loadMore 
  } = useProperties()

  useEffect(() => {
    console.log('Properties count:', properties.length)
  }, [properties])

  // Optional: Implement infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  if (loading && properties.length === 0) return null

  return (
    <main className="relative h-screen">
      {/* Filter Panel */}
      <div className="absolute top-0 left-0 w-[380px] h-full z-10">
        <FilterPanel 
          filters={filters}
          onChange={setFilters}
          properties={filteredProperties}
        />
      </div>
      
      {/* Map with offset */}
      <div className="absolute top-0 right-0 h-full" style={{ left: '380px' }}>
        <Map 
          properties={filteredProperties}
          selectedDistricts={filters.district_ids || []}
        />
      </div>

      {loading && <LoadingStatus 
        loaded={loadingStatus.loaded}
        total={loadingStatus.total}
      />}
    </main>
  )
} 