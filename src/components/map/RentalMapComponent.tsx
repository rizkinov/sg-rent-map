'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Property, PropertyType } from '@/types/property'
import { Home, Bed, Bath, Square } from 'lucide-react'
import type { DivIcon, PointExpression } from 'leaflet'
import { formatPrice } from '@/lib/utils'
import L from 'leaflet'
import { getPropertyTypeColor } from '@/lib/utils'

// Define the icon type
interface PropertyIcon extends L.DivIconOptions {
  className: string
  iconSize: PointExpression
  iconAnchor: PointExpression
  html: string
}

// Create property icons with proper typing
const propertyIcons: Record<PropertyType, L.DivIcon> = {
  'Condo': L.divIcon({
    className: 'property-icon condo',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>`
  } as PropertyIcon),
  'HDB': L.divIcon({
    className: 'property-icon hdb',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div class="w-6 h-6 rounded-full bg-green-500 border-2 border-white"></div>`
  } as PropertyIcon),
  'Landed': L.divIcon({
    className: 'property-icon landed',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div class="w-6 h-6 rounded-full bg-orange-500 border-2 border-white"></div>`
  } as PropertyIcon)
}

interface RentalMapComponentProps {
  properties: Property[]
}

export default function RentalMapComponent({ properties }: RentalMapComponentProps) {
  return (
    <MapContainer
      center={[1.3521, 103.8198]}
      zoom={12}
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {properties.map(property => (
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