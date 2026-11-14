import { useMemo } from 'react'
import type { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { calcMedian, calcTypicalRange } from '@/lib/utils/district-utils'
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

// URA withholds some project names behind these; the street says more
const PLACEHOLDER_NAMES = new Set(['LANDED HOUSING DEVELOPMENT', 'NON-LANDED HOUSING DEVELOPMENT'])

/** "MARINA BAY RESIDENCES" -> "Marina Bay Residences", "KING GEORGE'S AVE" -> "King George's Ave" */
function titleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^|[\s@/(-])([a-z])/g, (_, before: string, letter: string) => before + letter.toUpperCase())
}

/**
 * A short description of one rental from its own fields, skipping any that
 * are missing: "HDB 2-room" or "Marina Bay Residences, 5 bed, 11,050 sqft".
 */
function describeRental(property: Property): string {
  if (property.property_type === 'HDB') {
    // HDB rows hold the flat type (2-room, 3-room...) in beds, and their sqft
    // is a fixed estimate for that flat type, so the type says it all
    return property.beds ? `HDB ${property.beds}-room` : 'HDB'
  }
  const name = property.property_name && !PLACEHOLDER_NAMES.has(property.property_name.toUpperCase())
    ? property.property_name
    : property.street_name
  return [
    name ? titleCase(name) : null,
    property.property_type === 'Landed' ? 'landed' : null,
    property.beds ? `${property.beds} bed` : null,
    property.sqft ? `${formatPrice(property.sqft)} sqft` : null,
  ].filter(Boolean).join(', ')
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
    // The true extremes, kept for the note under the headline figures
    let lowest = filteredProperties[0]
    let highest = filteredProperties[0]
    for (const property of filteredProperties) {
      if (property.rental_price < lowest.rental_price) lowest = property
      if (property.rental_price > highest.rental_price) highest = property
    }
    return {
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      median: calcMedian(prices),
      // 1st to 99th percentile: the raw min and max are single contracts
      // that read like errors
      range: calcTypicalRange(prices),
      lowest,
      highest,
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
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Average</div>
            <div className="text-lg font-semibold">${formatPrice(stats.avg)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Median</div>
            <div className="text-lg font-semibold">${formatPrice(stats.median)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm font-medium text-muted-foreground">Typical range</div>
            <div className="text-lg font-semibold">
              ${formatPrice(stats.range.low)} to ${formatPrice(stats.range.high)}
            </div>
            <div className="text-[11px] leading-tight text-muted-foreground">middle 98% of rents</div>
          </div>
        </div>

        <p className="text-xs leading-snug text-muted-foreground">
          {stats.lowest === stats.highest ? (
            <>One rent in view: ${formatPrice(stats.lowest.rental_price)} ({describeRental(stats.lowest)})</>
          ) : (
            <>
              Lowest ${formatPrice(stats.lowest.rental_price)} ({describeRental(stats.lowest)}) and
              highest ${formatPrice(stats.highest.rental_price)} ({describeRental(stats.highest)})
            </>
          )}
        </p>
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
      {selectedBeds && selectedBeds.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Bedrooms</div>
          <div className="flex flex-wrap gap-1">
            {selectedBeds.map(beds => (
              <span
                key={beds}
                className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary"
              >
                <Bed className="w-3 h-3 mr-1" />
                {beds === 0 ? 'Beds N/A' : beds === 5 ? '5+ beds' : `${beds} beds`}
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
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Districts</div>
          <div className="space-y-2">
            {(Object.entries(groupedDistricts) as [Region, number[]][]).map(([region, districts]) => (
              <div key={region}>
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