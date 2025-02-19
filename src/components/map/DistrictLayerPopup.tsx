import { Building2, Home, Building } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { District } from '@/data/districts/singapore-districts'
import type { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DistrictLayerPopupProps {
  district: District
  properties: Property[]
}

export function DistrictLayerPopup({ district, properties }: DistrictLayerPopupProps) {
  console.log(`DistrictLayerPopup render for D${district.id}:`, {
    totalProperties: properties.length,
    propertiesSnapshot: properties.map(p => ({
      id: p.id,
      price: p.rental_price,
      sqft: p.sqft
    }))
  });

  const topProperties = [...properties]
    .sort((a, b) => b.rental_price - a.rental_price)
    .slice(0, 3);

  console.log(`Top properties for D${district.id}:`, {
    count: topProperties.length,
    properties: topProperties.map(p => ({
      id: p.id,
      price: p.rental_price
    }))
  });

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
    topProperties: topProperties
      .map(property => ({
        id: property.id,
        property_name: property.property_name,
        property_type: property.property_type,
        rental_price: property.rental_price,
        beds: property.beds,
        sqft: property.sqft
      }))
  }

  // Define property type order
  const propertyTypeOrder = ['Condo', 'HDB', 'Landed']

  return (
    <Card className="min-w-[280px] border-0 shadow-none font-inter">
      <CardContent className="p-3 space-y-3">
        {/* Header with styled district number */}
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
            D{district.id}
          </div>
          <div className="text-xs text-muted-foreground">{district.name}</div>
        </div>

        {/* Price Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="font-bold text-primary">${formatPrice(stats.avgPrice)}</div>
            <div className="text-[10px] text-muted-foreground">Average</div>
          </div>
          <div>
            <div className="font-bold text-primary">${formatPrice(stats.minPrice)}</div>
            <div className="text-[10px] text-muted-foreground">Min</div>
          </div>
          <div>
            <div className="font-bold text-primary">${formatPrice(stats.maxPrice)}</div>
            <div className="text-[10px] text-muted-foreground">Max</div>
          </div>
        </div>

        <Separator className="my-1" />

        {/* Property Types - reordered */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground">Property Types</div>
          <div className="flex flex-wrap gap-1">
            {propertyTypeOrder.map((type, index) => (
              stats.typeCounts[type] > 0 && (
                <span
                  key={type}
                  className={cn("text-[10px]",
                    type === 'Condo' ? "text-blue-600" :
                    type === 'HDB' ? "text-green-600" :
                    "text-orange-600"
                  )}
                >
                  {index > 0 && '· '}{type}: {stats.typeCounts[type]}
                </span>
              )
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground">Bedrooms</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.bedCounts)
              .sort(([a], [b]) => {
                if (a === '5+') return 1
                if (b === '5+') return -1
                return Number(a) - Number(b)
              })
              .map(([beds, count], index) => (
                <span key={beds} className="text-[10px]">
                  {index > 0 && '· '}{beds}BR: {count}
                </span>
              ))}
          </div>
        </div>

        {/* Average Size */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground">Average Size</div>
          <div className="text-[10px]">{formatPrice(stats.avgSize)} sqft</div>
        </div>

        {/* Top Properties - now guaranteed to show only 3 */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground">Top Properties</div>
          <div className="space-y-1">
            {stats.topProperties.map(property => (
              <div key={property.id} className="bg-muted/50 p-1.5 rounded">
                <div className="text-[10px] font-medium">{property.property_name}</div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{property.beds}BR · {formatPrice(property.sqft)}sqft</span>
                  <span className="font-bold text-primary">${formatPrice(property.rental_price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 