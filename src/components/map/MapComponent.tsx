import { MapContainer } from 'react-leaflet'
import { PropertyMarkers } from './PropertyMarkers'
import { DistrictMarkers } from './DistrictMarkers'
import type { Property } from '@/types/property'
import { Basemap } from './Basemap'
import { MAP_MAX_ZOOM } from '@/lib/basemap'

interface MapComponentProps {
  properties: Property[]
  selectedDistricts: number[]
}

export default function MapComponent({ properties, selectedDistricts }: MapComponentProps) {
  return (
    <MapContainer
      center={[1.3521, 103.8198]}
      zoom={12}
      maxZoom={MAP_MAX_ZOOM}
      className="h-full w-full"
    >
      <Basemap />
      <DistrictMarkers 
        properties={properties} 
        selectedDistricts={selectedDistricts}
      />
      <PropertyMarkers properties={properties} />
    </MapContainer>
  )
} 