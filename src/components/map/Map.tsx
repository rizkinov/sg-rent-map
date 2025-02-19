'use client'

import dynamic from 'next/dynamic'
import type { Property } from '@/types/property'
import { LoadingStatus } from '@/components/LoadingStatus'

// Dynamically import MapView with no SSR
const MapView = dynamic(
  () => import('./MapView').then(mod => mod.MapView),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        Loading map...
      </div>
    )
  }
)

interface MapProps {
  properties: Property[]
  selectedDistricts: number[]
  loading?: boolean
  loadingStatus?: {
    loaded: number
    total: number
  }
}

export function Map({ 
  properties, 
  selectedDistricts,
  loading,
  loadingStatus 
}: MapProps) {
  return (
    <div className="relative h-full w-full">
      <MapView 
        properties={properties}
        selectedDistricts={selectedDistricts}
      />
      {loading && loadingStatus && (
        <LoadingStatus 
          loaded={loadingStatus.loaded} 
          total={loadingStatus.total} 
        />
      )}
    </div>
  )
} 