'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { X, Filter } from 'lucide-react'
import type { FilterParams } from '@/types/property'

const filterSchema = z.object({
  property_type: z.array(z.string()),
  sqft_range: z.array(z.number()).length(2),
  beds: z.array(z.number()),
  bathrooms: z.array(z.number()),
})

interface PropertyFiltersProps {
  filters: FilterParams
  onFilterChange: (filters: FilterParams) => void
}

const MIN_SQFT = 300
const MAX_SQFT = 2100
const SQFT_STEP = 100

export function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      property_type: filters.property_type || [],
      beds: filters.beds || [],
      sqft_range: [filters.sqft_min || 0, filters.sqft_max || 10000],
    },
  })

  const onSubmit = (values: z.infer<typeof filterSchema>) => {
    onFilterChange({
      ...filters,
      property_type: values.property_type as ('Condo' | 'HDB' | 'Landed')[],
      sqft_min: values.sqft_range[0],
      sqft_max: values.sqft_range[1],
      beds: values.beds,
    })
  }

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) onSubmit(value as z.infer<typeof filterSchema>)
    })
    return () => subscription.unsubscribe()
  }, [form, onFilterChange])

  const hasActiveFilters = 
    form.watch('property_type').length > 0 ||
    form.watch('beds').length > 0 ||
    form.watch('sqft_range')[0] !== 0 ||
    form.watch('sqft_range')[1] !== 10000

  return (
    <Form {...form}>
      <form 
        className="h-full flex flex-col"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="font-semibold">Filters</h2>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => form.reset()}
              className="h-8 px-2 text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-4">
            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                {form.watch('property_type').length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{form.watch('property_type').join(', ')}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{form.watch('sqft_range')[0]} - {form.watch('sqft_range')[1]} sqft</span>
                </div>
                {form.watch('beds').length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Beds:</span>
                    <span>{form.watch('beds').sort((a, b) => a - b).join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Property Type */}
            <FormField
              control={form.control}
              name="property_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Property Type</FormLabel>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['Condo', 'HDB', 'Landed'].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={field.value?.includes(type) ? "default" : "outline"}
                        className="h-8"
                        onClick={() => {
                          const newValue = field.value?.includes(type)
                            ? field.value.filter((t) => t !== type)
                            : [...(field.value || []), type]
                          field.onChange(newValue)
                        }}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {/* Square Footage */}
            <FormField
              control={form.control}
              name="sqft_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Size (sqft)</FormLabel>
                  <div className="pt-2 px-1">
                    <Slider
                      min={0}
                      max={10000}
                      step={SQFT_STEP}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{field.value[0]}</span>
                      <span className="text-sm text-muted-foreground">{field.value[1]}</span>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Bedrooms */}
            <FormField
              control={form.control}
              name="beds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Bedrooms</FormLabel>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        variant={field.value?.includes(num) ? "default" : "outline"}
                        className="h-8"
                        onClick={() => {
                          const newValue = field.value?.includes(num)
                            ? field.value.filter((n) => n !== num)
                            : [...(field.value || []), num]
                          field.onChange(newValue)
                        }}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  )
}