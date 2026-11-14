'use client'

import { useEffect, useRef } from 'react'
import { Property, FilterParams } from '@/types/property'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Cross2Icon } from "@radix-ui/react-icons"
import { ChevronDown, Filter } from "lucide-react"
import { PropertyTypeFilter } from './PropertyTypeFilter'
import { DistrictFilter } from './DistrictFilter'
import { BedroomFilter } from './BedroomFilter'
import { SqftFilter } from './SqftFilter'
import { FilterSummary } from './FilterSummary'
import type { PropertyType } from '@/types/property'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  filters: FilterParams
  onChange: (filters: FilterParams) => void
  properties: Property[]
  /**
   * `sidebar` (default) is the fixed 380px desktop panel. `sheet` fills its
   * container, drops the eyebrow and title (the phone top bar shows them)
   * and adds a close control that calls `onClose`.
   */
  variant?: 'sidebar' | 'sheet'
  onClose?: () => void
}

export function FilterPanel({
  filters,
  onChange,
  properties,
  variant = 'sidebar',
  onClose
}: FilterPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isSheet = variant === 'sheet'

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

  const summary = (
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
  )

  return (
    <Card className={cn("h-full border-0 rounded-none overflow-hidden", isSheet ? "w-full" : "w-[380px]")}>
      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-background shadow-[0_4px_10px_-4px_rgba(0,0,0,0.1)]">
          <div className={cn("p-4 space-y-4", isSheet && "pt-2")}>
            {!isSheet && (
              <div>
                <a
                  href="https://www.lifekit.sg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-[#b5484d] transition-colors"
                >
                  lifekit.sg / housing
                </a>
                <h1 className="text-lg font-semibold tracking-tight mt-1">Singapore Rent Map</h1>
              </div>
            )}
            <div className="flex items-center justify-between">
              <h2
                className={cn(
                  "text-sm font-medium text-muted-foreground",
                  isSheet && "text-base font-semibold tracking-tight text-foreground"
                )}
              >
                Filters
              </h2>
              {isSheet ? (
                <div className="flex items-center gap-1 -mr-2">
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-11 px-3 text-muted-foreground hover:text-foreground"
                    >
                      <Cross2Icon className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  )}
                  {onClose && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      aria-label="Close filters"
                      className="h-11 w-11 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              ) : hasFilters && (
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

            {!isSheet && summary}
          </div>
        </div>

        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className={cn("space-y-6 pb-8 pt-6", isSheet && "pt-4")}>
            {/* In the sheet the summary scrolls with the filters, so a tall
                summary (many chips) can't squeeze the controls on a phone */}
            {isSheet && (
              <>
                {summary}
                <Separator />
              </>
            )}

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
              <p>
                HDB data: rental approvals from Nov 2025 to Oct 2026 (data.gov.sg, HDB).
                Condo/Landed data: URA rental contracts from Oct 2025 to Sep 2026.
              </p>
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
              <p className="pt-1">
                Part of{' '}
                <a
                  href="https://www.lifekit.sg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-[#b5484d] transition-colors"
                >
                  lifekit.sg
                </a>{' '}
                — free tools for living in Singapore.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
} 