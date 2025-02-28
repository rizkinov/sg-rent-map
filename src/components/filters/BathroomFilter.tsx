import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface BathroomFilterProps {
  selected: number[]
  onChange: (bathrooms: number[]) => void
}

export function BathroomFilter({ selected, onChange }: BathroomFilterProps) {
  const bathroomOptions = [1, 2, 3, 4]

  const handleChange = (checked: boolean, value: number) => {
    if (checked) {
      onChange([...selected, value])
    } else {
      onChange(selected.filter(b => b !== value))
    }
  }

  return (
    <div className="space-y-3">
      {bathroomOptions.map(num => (
        <div key={num} className="flex items-center space-x-2">
          <Checkbox
            id={`bathroom-${num}`}
            checked={selected.includes(num)}
            onCheckedChange={(checked) => handleChange(checked as boolean, num)}
          />
          <Label
            htmlFor={`bathroom-${num}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
          </Label>
        </div>
      ))}
    </div>
  )
} 