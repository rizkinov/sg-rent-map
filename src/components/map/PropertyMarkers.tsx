import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Bed, Bath, Move, MapPin } from 'lucide-react'
import type { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { districtData } from '@/data/districts/singapore-districts'

// Define marker icons for different property types
const createIcon = (color: string) => L.divIcon({
  className: 'property-marker',
  html: `
    <div class="w-3 h-3 rounded-full ${color} border border-white shadow-md"></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -6],
})

const icons = {
  Condo: createIcon('bg-blue-500'),
  HDB: createIcon('bg-green-500'),
  Landed: createIcon('bg-orange-500')
}

// Add CSS for the property markers
const style = document.createElement('style')
style.textContent = `
  .property-marker {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .property-marker > div {
    transition: all 0.2s ease;
    transform: scale(1);
  }
  .property-marker:hover > div {
    transform: scale(1.1);
  }
`
document.head.appendChild(style)

interface PropertyMarkersProps {
  properties: Property[]
}

export function PropertyMarkers({ properties }: PropertyMarkersProps) {
  const getDistrictInfo = (property: Property) => {
    // First try to use district
    if (property.district) {
      return districtData.find(d => d.id === property.district)
    }
    
    // Fallback to lat/lng check
    return districtData.find(district => {
      const latDiff = Math.abs(district.center.lat - property.latitude)
      const lngDiff = Math.abs(district.center.lng - property.longitude)
      return latDiff < 0.02 && lngDiff < 0.02
    })
  }

  const getDistrictAvgPrice = (district: typeof districtData[0]) => {
    const districtProperties = properties.filter(p => {
      const latDiff = Math.abs(district.center.lat - p.latitude)
      const lngDiff = Math.abs(district.center.lng - p.longitude)
      return latDiff < 0.02 && lngDiff < 0.02
    })
    return districtProperties.length
      ? Math.round(districtProperties.reduce((sum, p) => sum + p.rental_price, 0) / districtProperties.length)
      : 0
  }

  return (
    <>
      {properties.map((property) => {
        const district = getDistrictInfo(property)
        const avgPrice = district ? getDistrictAvgPrice(district) : 0
        
        return (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={icons[property.property_type]}
          >
            <Popup className="property-popup">
              <div className="space-y-2">
                <div className="font-medium">{property.property_name}</div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {property.beds >= 5 ? "5+" : property.beds}BR
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    {property.baths ?? '-'}B
                  </span>
                  <span className="flex items-center gap-1">
                    <Move className="h-4 w-4" />
                    {formatPrice(property.sqft)}sqft
                  </span>
                </div>
                <div className="text-lg font-semibold">
                  ${formatPrice(property.rental_price)}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
} 