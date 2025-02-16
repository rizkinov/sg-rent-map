import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/utils'

interface SqftFilterProps {
  min?: number
  max?: number
  onChange: (values: { min?: number; max?: number }) => void
}

export function SqftFilter({ min, max, onChange }: SqftFilterProps) {
  const minSqft = 500
  const maxSqft = 4000
  const step = 100

  const handleChange = (values: number[]) => {
    onChange({
      min: values[0],
      max: values[1]
    })
  }

  return (
    <div className="space-y-5">
      <Slider
        defaultValue={[min || minSqft, max || maxSqft]}
        value={[min || minSqft, max || maxSqft]}
        min={minSqft}
        max={maxSqft}
        step={step}
        minStepsBetweenThumbs={1}
        onValueChange={handleChange}
        className="mt-6"
      />
      <div className="flex justify-between items-center text-sm">
        <div className="text-muted-foreground">
          <span className="text-foreground font-medium">{formatPrice(min || minSqft)}</span> ft²
        </div>
        <div className="text-muted-foreground">
          <span className="text-foreground font-medium">{formatPrice(max || maxSqft)}</span> ft²
        </div>
      </div>
    </div>
  )
} 