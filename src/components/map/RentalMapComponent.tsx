'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Property } from '@/types/property'
import { Home, Bed, Bath, Square } from 'lucide-react'
import type { Icon } from 'leaflet'

const SINGAPORE_CENTER = {
  lat: 1.3521,
  lng: 103.8198
}

interface RentalMapComponentProps {
  properties: Property[]
}

export default function RentalMapComponent({ properties }: RentalMapComponentProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  useEffect(() => {
    (async () => {
      const L = (await import('leaflet')).default
      
      // Fix Leaflet default icon paths
      L.Icon.Default.mergeOptions({
        iconUrl: '/marker-icon.png',
        iconRetinaUrl: '/marker-icon-2x.png',
        shadowUrl: '/marker-shadow.png'
      })

      // Safely delete the internal property if it exists
      const iconPrototype = L.Icon.Default.prototype as any
      if (iconPrototype._getIconUrl) {
        delete iconPrototype._getIconUrl
      }
    })()
  }, [])

  return (
    <MapContainer
      center={SINGAPORE_CENTER}
      zoom={12}
      className="w-full h-[calc(100vh-4rem)]"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map(property => (
        <Marker 
          key={property.id}
          position={[property.latitude, property.longitude]}
        >
          <Popup className="w-64">
            <div className="p-1">
              {/* Price */}
              <div className="text-lg font-bold text-primary mb-2">
                {formatPrice(property.rental_price)}/month
              </div>

              {/* Property Type */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.property_type}</span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
                <div className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{property.beds >= 5 ? "5+" : property.beds}</strong> Beds
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{property.baths ?? '-'}</strong> Baths
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{formatNumber(property.sqft)}</strong> sqft
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
} 