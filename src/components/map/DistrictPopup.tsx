import { Card, CardContent } from "@/components/ui/card"
import { Building2, Home, Building } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { calcMedian, calcTypicalRange } from "@/lib/utils/district-utils"
import type { District } from "@/types/district"
import type { Property } from "@/types/property"

interface DistrictPopupProps {
  district: District
  properties: Property[]
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

export function DistrictPopup({ district, properties }: DistrictPopupProps) {
  const header = (
    <div className="space-y-1">
      <h3 className="font-medium">District {district.id}</h3>
      <p className="text-sm text-muted-foreground">{district.name}</p>
    </div>
  )

  // The filters can leave a district with no rentals; don't show $0 for it
  if (properties.length === 0) {
    return (
      <Card className="min-w-[280px] border-0 shadow-none">
        <CardContent className="p-4 space-y-4">
          {header}
          <p className="text-sm text-muted-foreground">No rentals match your filters</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate live statistics from properties
  const stats = {
    avgPrice: Math.round(properties.reduce((sum, p) => sum + p.rental_price, 0) / properties.length),
    medianPrice: calcMedian(properties.map(p => p.rental_price)),
    propertyTypes: properties.reduce((acc, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    typicalRange: calcTypicalRange(properties.map(p => p.rental_price)),
    avgSize: Math.round(properties.reduce((sum, p) => sum + p.sqft, 0) / properties.length)
  }

  return (
    <Card className="min-w-[280px] border-0 shadow-none">
      <CardContent className="p-4 space-y-4">
        {header}

        {/* Property Types */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Property Types</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.propertyTypes).map(([type, count]) => {
              const Icon = propertyTypeIcons[type]
              return count > 0 ? (
                <div 
                  key={type}
                  className="flex items-center gap-1 text-sm"
                >
                  <Icon className={cn("h-4 w-4", propertyTypeColors[type])} />
                  <span>{count}</span>
                </div>
              ) : null
            })}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Rental Prices</div>
          <div className="text-sm">
            <div>Average: ${formatPrice(stats.avgPrice)}</div>
            <div>Median: ${formatPrice(stats.medianPrice)}</div>
            <div className="text-muted-foreground">
              Typical range: ${formatPrice(stats.typicalRange.low)} to ${formatPrice(stats.typicalRange.high)} (middle 98% of rents)
            </div>
          </div>
        </div>

        {/* Average Size */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Average Size</div>
          <div className="text-sm">{formatPrice(stats.avgSize)} sqft</div>
        </div>
      </CardContent>
    </Card>
  )
} 