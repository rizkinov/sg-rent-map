'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Property } from '@/types/property'
import { Home, Bed, Bath, Square } from 'lucide-react'
import type { Icon, PointExpression } from 'leaflet'
import { formatPrice } from '@/lib/utils'

interface RentalMapComponentProps {
  properties: Property[]
}

// Define marker icons for different property types
const iconSize: PointExpression = [25, 25]
const iconAnchor: PointExpression = [12.5, 12.5]

const createIcon = (color: string) => ({
  className: `bg-${color} rounded-full border-2 border-white shadow-md`,
  iconSize,
  iconAnchor,
  html: `<div class="w-full h-full flex items-center justify-center text-white">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
    </svg>
  </div>`
})

const propertyIcons = {
  Condo: createIcon('blue-500'),
  HDB: createIcon('green-500'),
  Landed: createIcon('orange-500')
}

export default function RentalMapComponent({ properties }: RentalMapComponentProps) {
  return (
    <MapContainer
      center={[1.3521, 103.8198]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={propertyIcons[property.property_type]}
        >
          <Popup className="property-popup">
            <div className="p-2">
              <h3 className="font-semibold text-sm mb-2">{property.property_name}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span>{property.property_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  <span>{property.beds} Beds</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-3 h-3" />
                  <span>{property.baths} Baths</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-3 h-3" />
                  <span>{property.sqft} sqft</span>
                </div>
              </div>
              <div className="mt-2 text-sm font-medium">
                ${formatPrice(property.rental_price)}/mo
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
} 