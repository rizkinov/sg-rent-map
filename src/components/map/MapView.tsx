'use client'

import { MapContainer } from 'react-leaflet'
import type { Property } from '@/types/property'
import { DistrictLayers } from './DistrictLayers'
import { Basemap } from './Basemap'
import { MAP_MAX_ZOOM } from '@/lib/basemap'

/**
 * The map opens fitted to Singapore, so a wide screen no longer opens on Johor
 * and Batam. Desktop fits the whole main island, Sentosa included. A phone
 * fits the spread of the 28 district markers instead, so the city fills the
 * width rather than sitting small in the middle. Finer zoom steps let each
 * fit closely.
 */
const ISLAND: [[number, number], [number, number]] = [
  [1.205, 103.605],
  [1.475, 104.045],
]
const DISTRICTS: [[number, number], [number, number]] = [
  [1.266, 103.71],
  [1.448, 103.975],
]

interface MapViewProps {
  properties: Property[]
  selectedDistricts: number[]
}

export function MapView({ properties, selectedDistricts }: MapViewProps) {
  // Client only (loaded with ssr: false), and read once: the opening view.
  const phone = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        bounds={phone ? DISTRICTS : ISLAND}
        boundsOptions={{ padding: [16, 16] }}
        zoomSnap={phone ? 0.25 : 0.5}
        maxZoom={MAP_MAX_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <Basemap />
        <DistrictLayers 
          properties={properties}
          selectedDistricts={selectedDistricts}
        />
      </MapContainer>
    </div>
  )
} 