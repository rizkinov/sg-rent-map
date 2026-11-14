'use client'

import { MapContainer } from 'react-leaflet'
import type { Property } from '@/types/property'
import { DistrictLayers } from './DistrictLayers'
import { Basemap } from './Basemap'
import { MAP_MAX_ZOOM } from '@/lib/basemap'

interface MapViewProps {
  properties: Property[]
  selectedDistricts: number[]
}

export function MapView({ properties, selectedDistricts }: MapViewProps) {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[1.3521, 103.8198]}
        zoom={11}
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