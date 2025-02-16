'use client'

import { useState } from 'react'
import { MapView } from '@/components/map/MapView'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { FilterSummary } from '@/components/filters/FilterSummary'
import { useProperties } from '@/hooks/useProperties'
import type { FilterParams } from '@/types/property'

export default function Home() {
  const [filters, setFilters] = useState<FilterParams>({})
  const { properties, isLoading, error } = useProperties(filters)

  return (
    <main className="flex min-h-screen">
      <FilterPanel 
        filters={filters} 
        onChange={setFilters}
        properties={properties || []}
      />
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading properties...</div>
          </div>
        )}

        <MapView 
          properties={properties || []} 
          selectedDistricts={filters.district_ids || []}
        />
      </div>
    </main>
  )
} 