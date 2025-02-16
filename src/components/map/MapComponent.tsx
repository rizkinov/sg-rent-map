import { MapContainer, TileLayer } from 'react-leaflet'
import { PropertyMarkers } from './PropertyMarkers'
import { DistrictMarkers } from './DistrictMarkers'
import type { Property } from '@/types/property'

interface MapComponentProps {
  properties: Property[]
  selectedDistricts: number[]
}

export default function MapComponent({ properties, selectedDistricts }: MapComponentProps) {
  return (
    <MapContainer
      center={[1.3521, 103.8198]}
      zoom={12}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
      />
      <DistrictMarkers 
        properties={properties} 
        selectedDistricts={selectedDistricts}
      />
      <PropertyMarkers properties={properties} />
    </MapContainer>
  )
} 