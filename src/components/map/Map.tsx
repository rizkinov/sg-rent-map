'use client'

import dynamic from 'next/dynamic'
import type { Property } from '@/types/property'

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
}

export function Map({ properties, selectedDistricts }: MapProps) {
  return (
    <div className="h-full w-full">
      <MapView 
        properties={properties}
        selectedDistricts={selectedDistricts}
      />
    </div>
  )
} 