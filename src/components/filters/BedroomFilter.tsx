import { Button } from '@/components/ui/button'
import type { Property } from '@/types/property'

interface BedroomFilterProps {
  selected: number[]
  onChange: (beds: number[]) => void
  properties: Property[]
}

// 0 is the explicit "N/A" option: URA doesn't publish bedroom counts for
// landed homes and some condo rentals, so those rows have no bedroom data.
const OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
  { value: 0, label: 'N/A' },
]

export function BedroomFilter({ selected, onChange, properties }: BedroomFilterProps) {
  const naCount = properties.filter(p => p.beds === null || p.beds === undefined).length

  const toggleBedroom = (num: number) => {
    if (selected.includes(num)) {
      onChange(selected.filter(b => b !== num))
    } else {
      onChange([...selected, num])
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-2">
        {OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={selected.includes(value) ? "default" : "outline"}
            className="h-8 px-0"
            onClick={() => toggleBedroom(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        URA doesn&apos;t publish bedroom counts for landed homes and some condo
        rentals ({naCount.toLocaleString()} listings) &mdash; select &ldquo;N/A&rdquo; to
        include them when a bedroom filter is on.
      </p>
    </div>
  )
}
