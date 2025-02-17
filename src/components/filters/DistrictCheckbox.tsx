import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { District } from '@/data/districts/singapore-districts'
import { cn } from "@/lib/utils"

interface DistrictCheckboxProps {
  district: District
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean, id: number) => void
  propertyCount: number
}

export function DistrictCheckbox({
  district,
  checked,
  disabled,
  onChange,
  propertyCount
}: DistrictCheckboxProps) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`district-${district.id}`}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(checked) => onChange(checked as boolean, district.id)}
          className="h-3.5 w-3.5"
        />
        <Label
          htmlFor={`district-${district.id}`}
          className={cn(
            "text-[11px]",
            disabled && "text-muted-foreground",
            "cursor-pointer leading-none"
          )}
        >
          D{district.id} {district.name}
        </Label>
      </div>
      <span className="text-[10px] text-muted-foreground">
        {propertyCount}
      </span>
    </div>
  )
} 