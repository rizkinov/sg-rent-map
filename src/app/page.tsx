'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Map } from '@/components/map/Map'
import type { FilterParams } from '@/types/property'
import { useProperties } from '@/hooks/useProperties'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { LoadingStatus } from '@/components/LoadingStatus'
import { PhoneTopBar } from '@/components/layout/PhoneTopBar'
import { FilterSheet } from '@/components/layout/FilterSheet'
import { calcMedian } from '@/lib/utils/district-utils'

/** One per filter group in use: type, size, districts, bedrooms. */
function countActiveFilters(filters: FilterParams): number {
  return [
    filters.property_type.length > 0,
    Boolean(filters.sqft_min || filters.sqft_max),
    filters.district_ids.length > 0,
    filters.beds.length > 0,
  ].filter(Boolean).length
}

export default function Home() {
  const [filters, setFilters] = useState<FilterParams>({
    district_ids: [],
    property_type: [],
    beds: []
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersButtonRef = useRef<HTMLButtonElement>(null)

  // Tailwind's md breakpoint: the desktop layout from 768px up
  const isDesktop = useMediaQuery('(min-width: 768px)', true)

  const {
    properties,
    isLoading,
    isLoadingMore,
    loadingStatus
  } = useProperties(filters)

  // Average and median for the phone top bar (the desktop panel shows its own)
  const priceStats = useMemo(() => {
    if (isDesktop || !properties.length) return null
    const prices = properties.map(p => p.rental_price)
    return {
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      median: calcMedian(prices),
    }
  }, [isDesktop, properties])

  // The sheet only exists below md; don't leave it open across a resize
  useEffect(() => {
    if (isDesktop) setFiltersOpen(false)
  }, [isDesktop])

  const openFilters = useCallback(() => setFiltersOpen(true), [])
  const closeFilters = useCallback(() => {
    setFiltersOpen(false)
    filtersButtonRef.current?.focus({ preventScroll: true })
  }, [])

  if (isLoading) return null

  // Below md the page is a column: top bar, then the map filling the rest,
  // with filters in a sheet over the map. From md up it is the original
  // layout: the 380px panel on the left and the map beside it. The map
  // wrapper stays in the same place in the tree either way, so crossing the
  // breakpoint (say, rotating a tablet) keeps the same Leaflet map.
  return (
    <main className="relative flex h-dvh flex-col overflow-hidden md:block md:h-screen md:overflow-visible">
      {isDesktop ? (
        <div className="absolute top-0 left-0 w-[380px] h-full z-10">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            properties={properties}
          />
        </div>
      ) : (
        <PhoneTopBar
          ref={filtersButtonRef}
          average={priceStats?.average ?? null}
          median={priceStats?.median ?? null}
          activeFilterCount={countActiveFilters(filters)}
          filtersOpen={filtersOpen}
          onOpenFilters={openFilters}
        />
      )}

      <div className="relative min-h-0 flex-1 md:absolute md:top-0 md:right-0 md:left-[380px] md:h-full">
        <Map
          properties={properties}
          selectedDistricts={filters.district_ids || []}
          loading={isLoading}
          loadingStatus={loadingStatus}
        />
      </div>

      {!isDesktop && (
        <FilterSheet
          open={filtersOpen}
          onClose={closeFilters}
          resultCount={properties.length}
        >
          <FilterPanel
            variant="sheet"
            onClose={closeFilters}
            filters={filters}
            onChange={setFilters}
            properties={properties}
          />
        </FilterSheet>
      )}

      {(isLoading || isLoadingMore) && <LoadingStatus
        loaded={loadingStatus.loaded}
        total={loadingStatus.total}
      />}
    </main>
  )
}
