'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { FilterParams, PropertyType } from '@/types/property'
import { useProperties } from '@/providers/PropertyProvider'

const propertyTypes: PropertyType[] = ['Condo', 'HDB', 'Landed']
const bedroomOptions = [1, 2, 3, 4, 5]

interface PropertyFiltersProps {
  filters: FilterParams
  onFilterChange: (filters: FilterParams) => void
}

export function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
  const { properties } = useProperties()

  // Calculate min/max sqft from properties
  const sqftRange = properties.reduce(
    (range, property) => ({
      min: Math.min(range.min, property.sqft),
      max: Math.max(range.max, property.sqft)
    }),
    { min: Infinity, max: -Infinity }
  )

  const handlePropertyTypeChange = (type: PropertyType) => {
    const newTypes = filters.property_type.includes(type)
      ? filters.property_type.filter(t => t !== type)
      : [...filters.property_type, type]
    onFilterChange({ ...filters, property_type: newTypes })
  }

  const handleBedroomChange = (beds: number) => {
    const newBeds = filters.beds.includes(beds)
      ? filters.beds.filter(b => b !== beds)
      : [...filters.beds, beds]
    onFilterChange({ ...filters, beds: newBeds })
  }

  const handleSqftChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      sqft_min: value[0],
      sqft_max: value[1]
    })
  }

  return (
    <Card className="p-4">
      {/* Filter UI components */}
    </Card>
  )
} 