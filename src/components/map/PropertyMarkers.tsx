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
    // First try to use district_id
    if (property.district_id) {
      return districtData.find(d => d.id === property.district_id)
    }
    
    // Fallback to lat/lng check
    return districtData.find(d => 
      Math.abs(d.center.lat - property.latitude) < 0.02 && 
      Math.abs(d.center.lng - property.longitude) < 0.02
    )
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
              <div className="p-4">
                {/* Header with Property Type and Date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      property.property_type === 'Condo' ? 'bg-blue-500' :
                      property.property_type === 'HDB' ? 'bg-green-500' :
                      'bg-orange-500'
                    }`} />
                    <h3 className="font-medium text-foreground">
                      {property.property_type}
                    </h3>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {formatDate(property.created_at)}
                  </span>
                </div>

                {/* Location */}
                {district && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" />
                    <span>
                      District {district.id} ({district.name})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <p className="text-xl font-bold text-primary">
                    ${formatPrice(property.rental_price)}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
                
                {/* Property Features */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <Bed className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="font-medium text-foreground">{property.bedrooms}</span>
                    <span className="text-xs text-muted-foreground">Beds</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <Bath className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="font-medium text-foreground">{property.bathrooms}</span>
                    <span className="text-xs text-muted-foreground">Baths</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <Move className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="font-medium text-foreground">{property.sqft}</span>
                    <span className="text-xs text-muted-foreground">ft²</span>
                  </div>
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