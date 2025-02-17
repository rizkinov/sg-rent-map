'use client'

import { Polygon, Tooltip } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import type { District } from '@/types/district'
import { districtBoundaries } from '@/data/districts/boundaries'

interface DistrictBoundariesProps {
  district: District
  isSelected: boolean
  onClick?: () => void
}

export function DistrictBoundaries({ district, isSelected, onClick }: DistrictBoundariesProps) {
  // Get boundaries for this district
  const boundaries = districtBoundaries[district.id as keyof typeof districtBoundaries]
  if (!boundaries || !Array.isArray(boundaries)) return null

  // Convert to LatLngExpression format
  const positions: LatLngExpression[] = boundaries.map(coords => {
    if (Array.isArray(coords) && coords.length === 2) {
      return [coords[0], coords[1]] as LatLngExpression
    }
    return [0, 0] // fallback, should never happen with valid data
  })

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: isSelected ? '#2563eb' : '#94a3b8',
        weight: isSelected ? 2 : 1,
        fillOpacity: isSelected ? 0.2 : 0.1,
      }}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Tooltip sticky>District {district.id}</Tooltip>
    </Polygon>
  )
} 