import { 
  MapPin, Home, BedDouble, Bath, Ruler, TrendingUp, 
  ArrowDown, ArrowUp, SlidersHorizontal 
} from 'lucide-react'
import { Property, FilterParams } from '@/types/property'
import { districtData } from '@/data/districts/singapore-districts'
import { formatPrice } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface FilterSummaryProps {
  filters: FilterParams
  properties: Property[]
}

const propertyTypeColors = {
  Condo: 'bg-blue-100 text-blue-800',
  HDB: 'bg-green-100 text-green-800',
  Landed: 'bg-orange-100 text-orange-800'
} as const

export function FilterSummary({ filters, properties }: FilterSummaryProps) {
  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  )

  if (!hasActiveFilters) {
    return (
      <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 rounded-lg border shadow-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <p>Use filters to refine your search across {properties.length} properties</p>
        </div>
      </div>
    )
  }

  const stats = {
    avgPrice: properties.length 
      ? Math.round(properties.reduce((sum, p) => sum + p.rental_price, 0) / properties.length)
      : 0,
    minPrice: Math.min(...properties.map(p => p.rental_price)),
    maxPrice: Math.max(...properties.map(p => p.rental_price)),
  }

  const selectedDistricts = filters.district_ids?.map(id => 
    districtData.find(d => d.id === id)
  ).filter(Boolean) || []

  return (
    <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 rounded-lg border shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Active Filters</h3>
        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {properties.length} properties
        </span>
      </div>

      {properties.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Avg. Price</div>
            <div className="font-medium text-sm">${formatPrice(stats.avgPrice)}</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Min</div>
            <div className="font-medium text-sm">${formatPrice(stats.minPrice)}</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Max</div>
            <div className="font-medium text-sm">${formatPrice(stats.maxPrice)}</div>
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm">
        {filters.property_type?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {filters.property_type.map(type => (
              <span 
                key={type}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  propertyTypeColors[type as keyof typeof propertyTypeColors]
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {selectedDistricts.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            {selectedDistricts.map(district => (
              <span 
                key={district?.id} 
                className="text-xs bg-muted/50 px-2 py-0.5 rounded"
              >
                D{district?.id}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 text-xs text-muted-foreground">
          {filters.bedrooms?.length > 0 && (
            <span>{filters.bedrooms.join('/')} bed</span>
          )}
          {filters.bathrooms?.length > 0 && (
            <span>{filters.bathrooms.join('/')} bath</span>
          )}
          {(filters.sqft_min || filters.sqft_max) && (
            <span>
              {filters.sqft_min && filters.sqft_max
                ? `${formatPrice(filters.sqft_min)}-${formatPrice(filters.sqft_max)} ft²`
                : filters.sqft_min
                ? `>${formatPrice(filters.sqft_min)} ft²`
                : `<${formatPrice(filters.sqft_max!)} ft²`
              }
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 