import { Card, CardContent } from "@/components/ui/card"
import { Building2, Home, Building } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
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
  // Calculate live statistics from properties
  const stats = {
    avgPrice: properties.length
      ? Math.round(properties.reduce((sum, p) => sum + p.rental_price, 0) / properties.length)
      : 0,
    propertyTypes: properties.reduce((acc, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    priceRange: {
      min: properties.length ? Math.min(...properties.map(p => p.rental_price)) : 0,
      max: properties.length ? Math.max(...properties.map(p => p.rental_price)) : 0
    },
    avgSize: properties.length
      ? Math.round(properties.reduce((sum, p) => sum + p.sqft, 0) / properties.length)
      : 0
  }

  return (
    <Card className="min-w-[280px] border-0 shadow-none">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="font-medium">District {district.id}</h3>
          <p className="text-sm text-muted-foreground">{district.name}</p>
        </div>

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
            <div className="text-muted-foreground">
              Range: ${formatPrice(stats.priceRange.min)} - ${formatPrice(stats.priceRange.max)}
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