import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { districtBoundaries } from '@/data/districts/district-boundaries'
import { districtData } from '@/data/districts/singapore-districts'

interface DistrictBoundariesProps {
  selectedDistricts: number[]
}

export function DistrictBoundaries({ selectedDistricts }: DistrictBoundariesProps) {
  const map = useMap()

  useEffect(() => {
    const districtLayer = L.geoJSON(districtBoundaries as any, {
      style: (feature) => {
        const isSelected = selectedDistricts.includes(feature?.properties?.district_id || 0)
        return {
          fillColor: isSelected ? '#3b82f6' : '#94a3b8',
          fillOpacity: isSelected ? 0.2 : 0.1,
          color: isSelected ? '#2563eb' : '#64748b',
          weight: isSelected ? 2 : 1,
        }
      },
      onEachFeature: (feature, layer) => {
        const district = districtData.find(d => d.id === feature.properties.district_id)
        if (district) {
          layer.bindTooltip(
            `District ${district.id}: ${district.name}`,
            { sticky: true }
          )
        }
      }
    }).addTo(map)

    return () => {
      map.removeLayer(districtLayer)
    }
  }, [map, selectedDistricts])

  return null
} 