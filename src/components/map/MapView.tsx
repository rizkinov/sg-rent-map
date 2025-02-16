'use client'

import dynamic from 'next/dynamic'
import type { Property } from '@/types/property'

// Dynamically import the map components with no SSR
const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false
})

interface MapViewProps {
  properties: Property[]
  selectedDistricts: number[]
}

export function MapView({ properties, selectedDistricts }: MapViewProps) {
  return <MapWithNoSSR properties={properties} selectedDistricts={selectedDistricts} />
} 