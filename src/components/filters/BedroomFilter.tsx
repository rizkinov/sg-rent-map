import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface BedroomFilterProps {
  selected: number[]
  onChange: (bedrooms: number[]) => void
}

export function BedroomFilter({ selected, onChange }: BedroomFilterProps) {
  const bedroomOptions = [1, 2, 3, 4, 5]

  const handleChange = (checked: boolean, value: number) => {
    if (checked) {
      onChange([...selected, value])
    } else {
      onChange(selected.filter(b => b !== value))
    }
  }

  return (
    <div className="space-y-3">
      {bedroomOptions.map(num => (
        <div key={num} className="flex items-center space-x-2">
          <Checkbox
            id={`bedroom-${num}`}
            checked={selected.includes(num)}
            onCheckedChange={(checked) => handleChange(checked as boolean, num)}
          />
          <Label
            htmlFor={`bedroom-${num}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
          </Label>
        </div>
      ))}
    </div>
  )
} 