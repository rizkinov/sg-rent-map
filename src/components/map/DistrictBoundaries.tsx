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
  const boundaries = districtBoundaries[district.id]
  if (!boundaries) return null

  const positions: LatLngExpression[] = boundaries.map(([lat, lng]) => [lat, lng])

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