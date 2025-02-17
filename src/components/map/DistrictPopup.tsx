import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Building2, Home, Building, Bed, Square } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/property"
import type { District } from "@/data/districts/singapore-districts"
import { useMemo } from "react"

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
  // Calculate district statistics
  const stats = useMemo(() => {
    const districtProperties = properties.filter(p => p.district === district.id)
    
    // Calculate averages and other stats
    const avgPrice = districtProperties.length
      ? Math.round(districtProperties.reduce((sum, p) => sum + p.rental_price, 0) / districtProperties.length)
      : 0
    const minPrice = districtProperties.length ? Math.min(...districtProperties.map(p => p.rental_price)) : 0
    const maxPrice = districtProperties.length ? Math.max(...districtProperties.map(p => p.rental_price)) : 0
    const avgSize = districtProperties.length
      ? Math.round(districtProperties.reduce((sum, p) => sum + p.sqft, 0) / districtProperties.length)
      : 0

    // Property type counts
    const typeCounts = districtProperties.reduce((acc, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Bedroom counts with 5+ grouping
    const bedCounts = districtProperties.reduce((acc, p) => {
      if (p.beds) {
        const bedKey = p.beds >= 5 ? '5+' : p.beds.toString()
        acc[bedKey] = (acc[bedKey] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Get top 3 properties by price
    const topProperties = [...districtProperties]
      .sort((a, b) => b.rental_price - a.rental_price)
      .slice(0, 3)

    return {
      avgPrice,
      minPrice,
      maxPrice,
      avgSize,
      typeCounts,
      bedCounts,
      topProperties
    }
  }, [district.id, properties])

  return (
    <Card className="border-none shadow-none font-helvetica">
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">
            DEBUG_TEST District {district.id}
          </h3>
          <div className="text-sm text-muted-foreground">{district.name}</div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-4">
        {/* Price Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-lg font-semibold">${formatPrice(stats.avgPrice)}</div>
            <div className="text-sm text-muted-foreground">Average</div>
          </div>
          <div>
            <div className="text-lg font-semibold">${formatPrice(stats.minPrice)}</div>
            <div className="text-sm text-muted-foreground">Min</div>
          </div>
          <div>
            <div className="text-lg font-semibold">${formatPrice(stats.maxPrice)}</div>
            <div className="text-sm text-muted-foreground">Max</div>
          </div>
        </div>

        {/* Property Types */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Property Types</div>
          <div className="flex gap-2 text-sm">
            {stats.typeCounts['HDB'] > 0 && (
              <span className="text-green-600">
                HDB: {stats.typeCounts['HDB']}
              </span>
            )}
            {stats.typeCounts['Condo'] > 0 && (
              <span className="text-blue-600">
                · Condo: {stats.typeCounts['Condo']}
              </span>
            )}
            {stats.typeCounts['Landed'] > 0 && (
              <span className="text-orange-600">
                · Landed: {stats.typeCounts['Landed']}
              </span>
            )}
          </div>
        </div>

        {/* Bedrooms - Updated to show 5+ */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Bedrooms</div>
          <div className="flex gap-2 text-sm text-muted-foreground">
            {Object.entries(stats.bedCounts)
              .sort(([a], [b]) => {
                if (a === '5+') return 1
                if (b === '5+') return -1
                return Number(a) - Number(b)
              })
              .map(([beds, count], index) => (
                <span key={beds}>
                  {index > 0 && '·'} {beds}BR: {count}
                </span>
              ))}
          </div>
        </div>

        {/* Average Size */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Average Size</div>
          <div className="text-sm text-muted-foreground">
            {formatPrice(stats.avgSize)} sqft
          </div>
        </div>

        {/* Top Properties */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Top Properties</div>
          <div className="space-y-2">
            {stats.topProperties.map(property => (
              <div key={property.id} className="bg-muted/50 p-2 rounded-lg">
                <div className="font-medium text-sm">{property.property_name}</div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{property.beds}BR · {formatPrice(property.sqft)}sqft</span>
                  <span>${formatPrice(property.rental_price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 