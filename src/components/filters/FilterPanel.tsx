import { PropertyTypeFilter } from './PropertyTypeFilter'
import { BedroomFilter } from './BedroomFilter'
import { BathroomFilter } from './BathroomFilter'
import { SqftFilter } from './SqftFilter'
import { DistrictFilter } from './DistrictFilter'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { X, SlidersHorizontal, Home, MapPin, Ruler, BedDouble, Bath } from 'lucide-react'
import type { FilterParams } from '@/types/property'
import { districtData } from '@/data/districts/singapore-districts'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FilterSummary } from './FilterSummary'

interface FilterPanelProps {
  filters: FilterParams
  onChange: (filters: FilterParams) => void
  totalProperties: number
  filteredCount: number
  properties: any[]
}

export function FilterPanel({ 
  filters, 
  onChange, 
  totalProperties,
  filteredCount,
  properties
}: FilterPanelProps) {
  const updateFilters = (updates: Partial<FilterParams>) => {
    onChange({ ...filters, ...updates })
  }

  const resetFilters = () => {
    onChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  )

  return (
    <div className="w-[400px] h-screen flex flex-col border-r">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
              <p className="text-sm text-muted-foreground">
                Showing {properties.length} of {properties.length} properties
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => onChange({})}
              className="h-8"
              disabled={!hasActiveFilters}
            >
              Reset
            </Button>
          </div>

          <FilterSummary 
            filters={filters}
            properties={properties}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <FilterSection 
          title="Property Type" 
          icon={<Home className="h-4 w-4" />}
          activeCount={filters.property_type?.length}
        >
          <PropertyTypeFilter
            selected={filters.property_type || []}
            onChange={property_type => updateFilters({ property_type })}
          />
        </FilterSection>

        <FilterSection 
          title="District" 
          icon={<MapPin className="h-4 w-4" />}
          activeCount={filters.district_ids?.length}
        >
          <DistrictFilter
            selectedDistricts={filters.district_ids || []}
            onChange={district_ids => updateFilters({ district_ids })}
            properties={properties}
          />
        </FilterSection>

        <FilterSection 
          title="Size" 
          icon={<Ruler className="h-4 w-4" />}
          activeCount={filters.sqft_min || filters.sqft_max ? 1 : 0}
        >
          <SqftFilter
            min={filters.sqft_min}
            max={filters.sqft_max}
            onChange={({ min, max }) => updateFilters({ sqft_min: min, sqft_max: max })}
          />
        </FilterSection>

        <FilterSection 
          title="Bedrooms" 
          icon={<BedDouble className="h-4 w-4" />}
          activeCount={filters.bedrooms?.length}
        >
          <BedroomFilter
            selected={filters.bedrooms || []}
            onChange={bedrooms => updateFilters({ bedrooms })}
          />
        </FilterSection>

        <FilterSection 
          title="Bathrooms" 
          icon={<Bath className="h-4 w-4" />}
          activeCount={filters.bathrooms?.length}
        >
          <BathroomFilter
            selected={filters.bathrooms || []}
            onChange={bathrooms => updateFilters({ bathrooms })}
          />
        </FilterSection>
      </ScrollArea>
    </div>
  )
}

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  activeCount?: number
}

function FilterSection({ title, icon, children, activeCount = 0 }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {icon}
          <span>{title}</span>
        </div>
        {activeCount > 0 && (
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </div>
      <div className="pl-6">
        {children}
      </div>
      <Separator className="mt-6" />
    </div>
  )
} 