import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import type { Property } from '@/types/property'

interface SqftFilterProps {
  min?: number
  max?: number
  onChange: (min: number | undefined, max: number | undefined) => void
  properties: Property[]
}

const MIN_SQFT = 0
const MAX_SQFT = 15000
const STEP = 100

export function SqftFilter({ min, max, onChange, properties }: SqftFilterProps) {
  const [localMin, setLocalMin] = useState<string>(min?.toString() || '')
  const [localMax, setLocalMax] = useState<string>(max?.toString() || '')
  const [sliderValue, setSliderValue] = useState<number[]>([
    min || MIN_SQFT,
    max || MAX_SQFT
  ])

  // Update local state when props change
  useEffect(() => {
    setLocalMin(min?.toString() || '')
    setLocalMax(max?.toString() || '')
    setSliderValue([min || MIN_SQFT, max || MAX_SQFT])
  }, [min, max])

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
    setLocalMin(value[0].toString())
    setLocalMax(value[1].toString())
    onChange(value[0], value[1])
  }

  const handleInputChange = (value: string, type: 'min' | 'max') => {
    const numValue = parseInt(value)
    
    if (type === 'min') {
      setLocalMin(value)
      if (!isNaN(numValue)) {
        const newMin = Math.max(MIN_SQFT, Math.min(numValue, sliderValue[1]))
        setSliderValue([newMin, sliderValue[1]])
        onChange(newMin, sliderValue[1])
      } else if (value === '') {
        setSliderValue([MIN_SQFT, sliderValue[1]])
        onChange(undefined, sliderValue[1])
      }
    } else {
      setLocalMax(value)
      if (!isNaN(numValue)) {
        const newMax = Math.min(MAX_SQFT, Math.max(numValue, sliderValue[0]))
        setSliderValue([sliderValue[0], newMax])
        onChange(sliderValue[0], newMax)
      } else if (value === '') {
        setSliderValue([sliderValue[0], MAX_SQFT])
        onChange(sliderValue[0], undefined)
      }
    }
  }

  return (
    <div className="space-y-3">
      <Slider
        min={MIN_SQFT}
        max={MAX_SQFT}
        step={STEP}
        value={sliderValue}
        onValueChange={handleSliderChange}
        className="py-1"
      />
      
      <div className="flex items-center gap-2 text-sm">
        <Input
          type="number"
          min={MIN_SQFT}
          max={sliderValue[1]}
          placeholder={MIN_SQFT.toString()}
          value={localMin}
          onChange={(e) => handleInputChange(e.target.value, 'min')}
          className="h-7 px-2"
        />
        <span className="text-muted-foreground text-xs">to</span>
        <Input
          type="number"
          min={sliderValue[0]}
          max={MAX_SQFT}
          placeholder={MAX_SQFT.toString()}
          value={localMax}
          onChange={(e) => handleInputChange(e.target.value, 'max')}
          className="h-7 px-2"
        />
        <span className="text-xs text-muted-foreground">sqft</span>
      </div>
    </div>
  )
} 