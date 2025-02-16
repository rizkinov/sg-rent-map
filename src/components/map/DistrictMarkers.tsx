import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'
import { districtData } from '@/data/districts/singapore-districts'
import type { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'

// Create a function to generate marker HTML with district number
const createMarkerHtml = (districtId: number) => `
  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-primary shadow-lg">
    <div class="text-xs font-semibold text-primary">D${districtId}</div>
  </div>
`

interface DistrictMarkersProps {
  properties: Property[]
  selectedDistricts: number[]
}

export function DistrictMarkers({ properties, selectedDistricts }: DistrictMarkersProps) {
  const getDistrictStats = (districtId: number) => {
    const districtProperties = properties.filter(p => {
      const district = districtData.find(d => d.id === districtId)
      if (!district) return false
      const latDiff = Math.abs(district.center.lat - p.latitude)
      const lngDiff = Math.abs(district.center.lng - p.longitude)
      return latDiff < 0.02 && lngDiff < 0.02
    })

    const avgPrice = districtProperties.length
      ? Math.round(districtProperties.reduce((sum, p) => sum + p.rental_price, 0) / districtProperties.length)
      : 0

    return {
      count: districtProperties.length,
      avgPrice
    }
  }

  // Filter districts based on selection
  const districtsToShow = selectedDistricts.length > 0
    ? districtData.filter(d => selectedDistricts.includes(d.id))
    : districtData

  return (
    <>
      {districtsToShow.map(district => {
        const stats = getDistrictStats(district.id)
        const isSelected = selectedDistricts.includes(district.id)
        
        // Create district-specific icon
        const districtIcon = L.divIcon({
          className: 'district-marker',
          html: createMarkerHtml(district.id),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -20],
        })
        
        return (
          <Marker
            key={district.id}
            position={[district.center.lat, district.center.lng]}
            icon={districtIcon}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup className="district-popup">
              <div className="p-4 min-w-[240px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    District {district.id}
                  </span>
                </div>
                <h3 className="font-medium text-foreground mb-3">{district.name}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <div className="text-xs text-muted-foreground">Properties</div>
                    <div className="font-medium text-sm">{stats.count}</div>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <div className="text-xs text-muted-foreground">Avg. Rent</div>
                    <div className="font-medium text-sm">
                      ${formatPrice(stats.avgPrice)}/mo
                    </div>
                  </div>
                </div>
                {stats.count > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Click to view properties in this district
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
} 