import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'
import { districtData } from '@/data/districts/singapore-districts'
import type { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { DistrictPopup } from './DistrictPopup'

// Add CSS for the district popup
const style = document.createElement('style')
style.textContent = `
  .district-popup .leaflet-popup-content {
    margin: 0;
    min-width: 300px;
  }
  .district-popup .leaflet-popup-content-wrapper {
    padding: 0;
    border-radius: 8px;
  }
  /* Ensure our styles take precedence */
  .district-popup .text-2xl {
    font-size: 1.5rem !important;
    line-height: 2rem !important;
    color: rgb(239, 68, 68) !important; /* red-500 */
  }
`
document.head.appendChild(style)

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
        const districtProperties = properties.filter(p => p.district === district.id)
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
              <DistrictPopup 
                district={district}
                properties={districtProperties}
              />
            </Popup>
          </Marker>
        )
      })}
    </>
  )
} 