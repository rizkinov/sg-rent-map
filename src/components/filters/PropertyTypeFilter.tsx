import { PropertyType } from '@/types/property'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface PropertyTypeFilterProps {
  selected: PropertyType[]
  onChange: (types: PropertyType[]) => void
}

export function PropertyTypeFilter({ selected, onChange }: PropertyTypeFilterProps) {
  const propertyTypes: PropertyType[] = ['Condo', 'HDB', 'Landed']

  const handleChange = (checked: boolean, type: PropertyType) => {
    if (checked) {
      onChange([...selected, type])
    } else {
      onChange(selected.filter(t => t !== type))
    }
  }

  return (
    <div className="space-y-3">
      {propertyTypes.map(type => (
        <div key={type} className="flex items-center space-x-2">
          <Checkbox
            id={`type-${type}`}
            checked={selected.includes(type)}
            onCheckedChange={(checked) => handleChange(checked as boolean, type)}
          />
          <Label
            htmlFor={`type-${type}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {type}
          </Label>
        </div>
      ))}
    </div>
  )
} 