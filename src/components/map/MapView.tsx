'use client'

import { MapContainer, TileLayer } from 'react-leaflet'
import type { Property } from '@/types/property'
import { DistrictLayers } from './DistrictLayers'

interface MapViewProps {
  properties: Property[]
  selectedDistricts: number[]
}

export function MapView({ properties, selectedDistricts }: MapViewProps) {
  return (
    <div className="absolute inset-0">
      <MapContainer
        center={[1.3521, 103.8198]}
        zoom={11}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <DistrictLayers 
          properties={properties}
          selectedDistricts={selectedDistricts}
        />
      </MapContainer>
    </div>
  )
} 