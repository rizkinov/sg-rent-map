import { useMemo } from 'react'
import { Building2, Home, Building } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Property, PropertyType } from '@/types/property'

interface PropertyTypeFilterProps {
  selected: string[]
  onChange: (types: string[]) => void
  properties: Property[]
}

const propertyTypes = [
  {
    id: 'Condo',
    label: 'Condo',
    icon: Building2,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 hover:border-blue-300',
    selectedColor: 'bg-blue-600 text-white border-blue-600'
  },
  {
    id: 'HDB',
    label: 'HDB',
    icon: Building,
    color: 'bg-green-500/10 text-green-600 border-green-200 hover:border-green-300',
    selectedColor: 'bg-green-600 text-white border-green-600'
  },
  {
    id: 'Landed',
    label: 'Landed',
    icon: Home,
    color: 'bg-orange-500/10 text-orange-600 border-orange-200 hover:border-orange-300',
    selectedColor: 'bg-orange-600 text-white border-orange-600'
  }
]

export function PropertyTypeFilter({ selected, onChange, properties }: PropertyTypeFilterProps) {
  // Calculate counts for each property type
  const propertyCounts = useMemo(() => {
    return properties.reduce((acc, property) => {
      acc[property.property_type] = (acc[property.property_type] || 0) + 1
      return acc
    }, {} as Record<PropertyType, number>)
  }, [properties])

  return (
    <div className="grid grid-cols-3 gap-2">
      {propertyTypes.map(type => {
        const Icon = type.icon
        const isSelected = selected.includes(type.id)
        const count = propertyCounts[type.id as PropertyType] || 0

        return (
          <button
            key={type.id}
            onClick={() => {
              if (isSelected) {
                onChange(selected.filter(t => t !== type.id))
              } else {
                onChange([...selected, type.id])
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center p-1.5 rounded-lg border transition-colors",
              "hover:border-primary/50",
              isSelected ? type.selectedColor : type.color
            )}
          >
            <Icon className="h-4 w-4 mb-1" />
            <div className="text-xs font-medium">{type.label}</div>
            <div className={cn(
              "text-[10px]",
              isSelected ? "text-white/90" : "text-muted-foreground"
            )}>
              {count.toLocaleString()} units
            </div>
          </button>
        )
      })}
    </div>
  )
} 