import { useMemo } from 'react'
import type { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { districtData, regions, type Region } from '@/data/districts/singapore-districts'
import { Building2, Home, Building, Bed, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterSummaryProps {
  properties: Property[]
  selectedDistricts: number[]
  selectedTypes: string[]
  selectedBeds?: number[]
  sqftRange?: { min?: number; max?: number }
}

const propertyTypeIcons: Record<string, any> = {
  'Condo': Building2,
  'HDB': Building,
  'Landed': Home,
}

const propertyTypeColors: Record<string, string> = {
  'Condo': 'bg-blue-500/10 text-blue-600',
  'HDB': 'bg-green-500/10 text-green-600',
  'Landed': 'bg-orange-500/10 text-orange-600',
}

export function FilterSummary({ properties, selectedDistricts, selectedTypes, selectedBeds = [], sqftRange }: FilterSummaryProps) {
  // Get filtered properties based on all filters
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Filter by district
      if (selectedDistricts.length && !selectedDistricts.includes(property.district || 0)) {
        return false
      }
      // Filter by property type
      if (selectedTypes.length && !selectedTypes.includes(property.property_type)) {
        return false
      }
      return true
    })
  }, [properties, selectedDistricts, selectedTypes])

  // Calculate stats from filtered properties
  const stats = useMemo(() => {
    if (!filteredProperties.length) return null

    const prices = filteredProperties.map(p => p.rental_price)
    return {
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [filteredProperties])

  // Group districts by region
  const groupedDistricts = useMemo(() => {
    if (!selectedDistricts.length) return {}

    return regions.reduce((acc, region) => {
      const districtsInRegion = districtData
        .filter(d => d.region === region && selectedDistricts.includes(d.id))
        .map(d => d.id)
        .sort((a, b) => a - b)

      if (districtsInRegion.length) {
        acc[region] = districtsInRegion
      }
      return acc
    }, {} as Record<Region, number[]>)
  }, [selectedDistricts])

  if (!stats) return null

  return (
    <div className="space-y-3">
      {/* Price Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Average</div>
          <div className="text-lg font-semibold">${formatPrice(stats.avg)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Min</div>
          <div className="text-lg font-semibold">${formatPrice(stats.min)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Max</div>
          <div className="text-lg font-semibold">${formatPrice(stats.max)}</div>
        </div>
      </div>

      {/* Selected Property Types */}
      {selectedTypes.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Property Types</div>
          <div className="flex flex-wrap gap-1">
            {selectedTypes.map(type => {
              const Icon = propertyTypeIcons[type]
              return (
                <span
                  key={type}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                    propertyTypeColors[type]
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {type}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Bedrooms */}
      {selectedBeds.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Bedrooms</div>
          <div className="flex flex-wrap gap-1">
            {selectedBeds.map(beds => (
              <span
                key={beds}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-600"
              >
                <Bed className="h-3 w-3" />
                {beds} {beds === 1 ? 'bed' : 'beds'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Sqft Range */}
      {(sqftRange?.min || sqftRange?.max) && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Size</div>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
              <Square className="h-3 w-3" />
              {sqftRange.min && sqftRange.max
                ? `${formatPrice(sqftRange.min)} - ${formatPrice(sqftRange.max)} sqft`
                : sqftRange.min
                ? `>${formatPrice(sqftRange.min)} sqft`
                : `<${formatPrice(sqftRange.max!)} sqft`}
            </span>
          </div>
        </div>
      )}

      {/* Selected Districts */}
      {selectedDistricts.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Selected Districts</div>
          <div className="space-y-2">
            {Object.entries(groupedDistricts).map(([region, districts]) => (
              <div key={region} className="space-y-0.5">
                <div className="text-[10px] font-medium text-muted-foreground">{region}</div>
                <div className="flex flex-wrap gap-1">
                  {districts.map(id => (
                    <span
                      key={id}
                      className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary"
                    >
                      D{id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 