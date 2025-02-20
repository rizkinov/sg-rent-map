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

  // Get unique properties by ID, keeping only the most recent one
  const uniqueProperties = Array.from(
    properties.reduce((map, property) => {
      if (!map.has(property.id) || 
          new Date(property.created_at) > new Date(map.get(property.id)!.created_at)) {
        map.set(property.id, property)
      }
      return map
    }, new Map<string, Property>())
  ).map(([_, property]) => property)

  // Calculate statistics using unique properties
  const stats = {
    avgPrice: uniqueProperties.length
      ? Math.round(uniqueProperties.reduce((sum, p) => sum + p.rental_price, 0) / uniqueProperties.length)
      : 0,
    propertyTypes: uniqueProperties.reduce((acc, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    priceRange: {
      min: Math.min(...uniqueProperties.map(p => p.rental_price)),
      max: Math.max(...uniqueProperties.map(p => p.rental_price))
    },
    avgSize: Math.round(
      uniqueProperties.reduce((sum, p) => sum + p.sqft, 0) / uniqueProperties.length
    ),
    bedroomCounts: uniqueProperties.reduce((acc, p) => {
      const beds = p.beds;
      if (beds !== null && beds !== undefined) {
        // Group all 5+ bedrooms together
        const bedKey = beds >= 5 ? '5+' : beds.toString();
        acc[bedKey] = (acc[bedKey] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    topProperties: uniqueProperties
      .sort((a, b) => b.rental_price - a.rental_price)
      .slice(0, 3)
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
            <div className="font-bold text-primary">${formatPrice(stats.priceRange.min)}</div>
            <div className="text-[10px] text-muted-foreground">Min</div>
          </div>
          <div>
            <div className="font-bold text-primary">${formatPrice(stats.priceRange.max)}</div>
            <div className="text-[10px] text-muted-foreground">Max</div>
          </div>
        </div>

        <Separator className="my-1" />

        {/* Property Types - reordered */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground">Property Types</div>
          <div className="flex flex-wrap gap-1">
            {propertyTypeOrder.map((type, index) => (
              stats.propertyTypes[type] > 0 && (
                <span
                  key={type}
                  className={cn("text-[10px]",
                    type === 'Condo' ? "text-blue-600" :
                    type === 'HDB' ? "text-green-600" :
                    "text-orange-600"
                  )}
                >
                  {index > 0 && '· '}{type}: {stats.propertyTypes[type]}
                </span>
              )
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground">Bedrooms</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.bedroomCounts)
              .sort(([a], [b]) => {
                // Custom sort to handle "5+" properly
                const aNum = a === '5+' ? 5 : parseInt(a);
                const bNum = b === '5+' ? 5 : parseInt(b);
                return aNum - bNum;
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