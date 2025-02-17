import { Property, FilterParams } from '@/types/property'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Cross2Icon } from "@radix-ui/react-icons"
import { Filter } from "lucide-react"
import { PropertyTypeFilter } from './PropertyTypeFilter'
import { DistrictFilter } from './DistrictFilter'
import { BedroomFilter } from './BedroomFilter'
import { SqftFilter } from './SqftFilter'
import { FilterSummary } from './FilterSummary'
import type { PropertyType } from '@/types/property'

interface FilterPanelProps {
  filters: FilterParams
  onChange: (filters: FilterParams) => void
  properties: Property[]
}

export function FilterPanel({ filters, onChange, properties }: FilterPanelProps) {
  const hasFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  )

  const handleReset = () => {
    onChange({
      district_ids: [],
      property_type: [],
      beds: []
    })
  }

  return (
    <Card className="h-full border-0 rounded-none w-[380px] overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-background shadow-[0_4px_10px_-4px_rgba(0,0,0,0.1)]">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              {hasFilters && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Cross2Icon className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>

            <FilterSummary 
              properties={properties}
              selectedDistricts={filters.district_ids || []}
              selectedTypes={filters.property_type || []}
              selectedBeds={filters.beds || []}
              sqftRange={{
                min: filters.sqft_min,
                max: filters.sqft_max
              }}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 pb-8 pt-6">
            {/* Property Type */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Property Type</Label>
              <PropertyTypeFilter
                selected={filters.property_type as PropertyType[]}
                onChange={types => onChange({ ...filters, property_type: types })}
                properties={properties}
              />
            </div>

            <Separator />

            {/* Size - Moved up, right after Property Type */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Size (sqft)</Label>
              <SqftFilter
                min={filters.sqft_min}
                max={filters.sqft_max}
                onChange={(min, max) => onChange({ ...filters, sqft_min: min, sqft_max: max })}
                properties={properties}
              />
            </div>

            <Separator />

            {/* Districts */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Districts</Label>
              <DistrictFilter
                selected={filters.district_ids || []}
                onChange={districts => onChange({ ...filters, district_ids: districts })}
                properties={properties}
              />
            </div>

            <Separator />

            {/* Bedrooms - with extra bottom margin */}
            <div className="space-y-4 mb-4">
              <Label className="text-sm font-medium">Bedrooms</Label>
              <BedroomFilter
                selected={filters.beds || []}
                onChange={beds => onChange({ ...filters, beds })}
                properties={properties}
              />
            </div>

            {/* Disclaimer */}
            <div className="text-[11px] text-muted-foreground space-y-1">
              <p>Note: This data is sourced from the 2024 Urban Redevelopment Authority dataset.</p>
              <p>
                For more details, visit{' '}
                <a 
                  href="https://eservice.ura.gov.sg/property-market-information/pmiResidentialRentalSearch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  URA Property Market Information
                </a>
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
} 