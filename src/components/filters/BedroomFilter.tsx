import { Button } from '@/components/ui/button'
import type { Property } from '@/types/property'

interface BedroomFilterProps {
  selected: number[]
  onChange: (beds: number[]) => void
  properties: Property[]
}

export function BedroomFilter({ selected, onChange, properties }: BedroomFilterProps) {
  // Get bedroom counts for display
  const bedroomCounts = properties.reduce((acc, property) => {
    const beds = property.beds
    if (beds !== null && beds !== undefined) {
      if (beds >= 5) {
        // Group all 5+ bedrooms together
        acc['5+'] = (acc['5+'] || 0) + 1
      } else {
        acc[beds] = (acc[beds] || 0) + 1
      }
    }
    return acc
  }, {} as Record<string, number>)

  const toggleBedroom = (num: number) => {
    if (selected.includes(num)) {
      onChange(selected.filter(b => b !== num))
    } else {
      onChange([...selected, num])
    }
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <Button
          key={num}
          type="button"
          variant={selected.includes(num) ? "default" : "outline"}
          className="h-8"
          onClick={() => toggleBedroom(num)}
        >
          {num === 5 ? "5+" : num}
        </Button>
      ))}
    </div>
  )
} 