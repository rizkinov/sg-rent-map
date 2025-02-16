import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { districtData } from '@/data/districts/singapore-districts'
import type { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'

interface DistrictPolygonsProps {
  properties: Property[]
  selectedDistricts: number[]
}

export function DistrictPolygons({ properties, selectedDistricts }: DistrictPolygonsProps) {
  const map = useMap()

  useEffect(() => {
    const districtLayers: L.Layer[] = []

    districtData.forEach(district => {
      // Calculate district statistics
      const districtProperties = properties.filter(p => {
        const latDiff = Math.abs(district.center.lat - p.latitude)
        const lngDiff = Math.abs(district.center.lng - p.longitude)
        return latDiff < 0.02 && lngDiff < 0.02
      })

      const avgPrice = districtProperties.length
        ? Math.round(districtProperties.reduce((sum, p) => sum + p.rental_price, 0) / districtProperties.length)
        : 0

      // Create polygon for the district
      const polygon = L.polygon(district.boundaries, {
        color: selectedDistricts.includes(district.id) ? '#2563eb' : '#94a3b8',
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0.1,
      })

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <div class="font-medium mb-2">District ${district.id}</div>
          <div class="text-sm text-muted-foreground mb-1">${district.name}</div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div class="text-xs text-muted-foreground">Properties</div>
              <div class="font-medium">${districtProperties.length}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground">Avg. Price</div>
              <div class="font-medium">$${formatPrice(avgPrice)}/mo</div>
            </div>
          </div>
        </div>
      `

      // Add popup to polygon
      polygon.bindPopup(popupContent, {
        className: 'district-popup'
      })

      // Add hover effect
      polygon.on('mouseover', () => {
        polygon.setStyle({
          fillOpacity: 0.3
        })
      })

      polygon.on('mouseout', () => {
        polygon.setStyle({
          fillOpacity: 0.1
        })
      })

      polygon.addTo(map)
      districtLayers.push(polygon)
    })

    // Cleanup on unmount
    return () => {
      districtLayers.forEach(layer => {
        map.removeLayer(layer)
      })
    }
  }, [map, properties, selectedDistricts])

  return null
} 