import { useCallback, useEffect, useMemo } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { districtData, type District } from '@/data/districts/singapore-districts'
import { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { Building2, Home, Building, Bed, Square } from 'lucide-react'
import { DistrictLayerPopup } from './DistrictLayerPopup'

interface DistrictLayersProps {
  properties: Property[]
  selectedDistricts: number[]
}

const propertyTypeIcons: Record<string, any> = {
  'Condo': Building2,
  'HDB': Building,
  'Landed': Home,
}

const propertyTypeColors: Record<string, string> = {
  'Condo': 'text-blue-600',
  'HDB': 'text-green-600',
  'Landed': 'text-orange-600',
}

function createPopupContent(district: District, properties: Property[]) {
  // Calculate stats
  const stats = {
    avgPrice: properties.length
      ? Math.round(properties.reduce((sum, p) => sum + p.rental_price, 0) / properties.length)
      : 0,
    minPrice: properties.length ? Math.min(...properties.map(p => p.rental_price)) : 0,
    maxPrice: properties.length ? Math.max(...properties.map(p => p.rental_price)) : 0,
    avgSize: properties.length
      ? Math.round(properties.reduce((sum, p) => sum + p.sqft, 0) / properties.length)
      : 0,
    typeCounts: properties.reduce((acc, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    bedCounts: properties.reduce((acc, p) => {
      if (p.beds) {
        const bedKey = p.beds >= 5 ? '5+' : p.beds.toString()
        acc[bedKey] = (acc[bedKey] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>),
    topProperties: [...properties]
      .sort((a, b) => b.rental_price - a.rental_price)
      .slice(0, 3)
  }

  return `
    <div class="min-w-[250px]">
      <div class="space-y-3 p-2">
        <div>
          <div class="text-sm font-medium">District ${district.id}</div>
          <div class="text-xs text-muted-foreground">${district.name}</div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <div class="font-bold text-primary">$${formatPrice(stats.avgPrice)}</div>
            <div class="text-muted-foreground text-[10px]">Average</div>
          </div>
          <div>
            <div class="font-bold text-primary">$${formatPrice(stats.minPrice)}</div>
            <div class="text-muted-foreground text-[10px]">Min</div>
          </div>
          <div>
            <div class="font-bold text-primary">$${formatPrice(stats.maxPrice)}</div>
            <div class="text-muted-foreground text-[10px]">Max</div>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-[10px] font-medium text-muted-foreground">Property Types</div>
          <div class="flex flex-wrap gap-1">
            ${Object.entries(stats.typeCounts)
              .map(([type, count], index) => `
                <div class="text-[10px] ${
                  type === 'Condo' ? 'text-blue-600' :
                  type === 'HDB' ? 'text-green-600' :
                  'text-orange-600'
                }">
                  ${index > 0 ? '· ' : ''}${type}: ${count}
                </div>
              `).join('')}
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-[10px] font-medium text-muted-foreground">Bedrooms</div>
          <div class="flex flex-wrap gap-1">
            ${Object.entries(stats.bedCounts)
              .sort(([a], [b]) => {
                if (a === '5+') return 1
                if (b === '5+') return -1
                return Number(a) - Number(b)
              })
              .map(([beds, count], index) => `
                <div class="text-[10px]">
                  ${index > 0 ? '· ' : ''}${beds}BR: ${count}
                </div>
              `).join('')}
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-[10px] font-medium text-muted-foreground">Average Size</div>
          <div class="text-[10px]">${formatPrice(stats.avgSize)} sqft</div>
        </div>

        <div class="space-y-1">
          <div class="text-[10px] font-medium text-muted-foreground">Top Properties</div>
          ${stats.topProperties.map(property => `
            <div class="bg-muted/50 p-1.5 rounded text-[10px]">
              <div class="font-medium">${property.property_name}</div>
              <div class="flex justify-between text-muted-foreground">
                <span>${property.beds}BR · ${formatPrice(property.sqft)}sqft</span>
                <span class="font-bold text-primary">$${formatPrice(property.rental_price)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

export function DistrictLayers({ properties, selectedDistricts = [] }: DistrictLayersProps) {
  const map = useMap()

  // Add console logs to check the props
  console.log('DistrictLayers - selectedDistricts:', selectedDistricts)

  // Filter properties based on selected districts
  const filteredProperties = useMemo(() => {
    if (selectedDistricts.length === 0) return properties
    return properties.filter(p => selectedDistricts.includes(p.district || 0))
  }, [properties, selectedDistricts])

  // Create district marker icon
  const createDistrictIcon = (text: string) => L.divIcon({
    className: 'district-marker',
    html: `
      <div class="w-6 h-6 rounded-full bg-white border border-primary flex items-center justify-center text-[10px] font-medium shadow-md">
        ${text}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  })

  // Only show markers for districts that are selected (or all if none selected)
  const visibleDistricts = useMemo(() => {
    const districts = selectedDistricts.length === 0 
      ? districtData 
      : districtData.filter(d => selectedDistricts.includes(d.id))
    console.log('DistrictLayers - visibleDistricts:', districts.map(d => d.id))
    return districts
  }, [selectedDistricts])

  return (
    <>
      {visibleDistricts.map(district => {
        const districtProperties = filteredProperties.filter(p => p.district === district.id)
        console.log(`Rendering district ${district.id}`)
        
        return (
          <Marker
            key={district.id}
            position={[district.center.lat, district.center.lng]}
            icon={createDistrictIcon(`D${district.id}`)}
          >
            <Popup className="district-popup">
              <DistrictLayerPopup 
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