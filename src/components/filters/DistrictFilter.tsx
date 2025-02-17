import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { districtData, regions, type Region } from '@/data/districts/singapore-districts'
import type { Property } from '@/types/property'
import { DistrictCheckbox } from './DistrictCheckbox'

interface DistrictFilterProps {
  selected: number[]
  onChange: (districts: number[]) => void
  properties: Property[]
}

export function DistrictFilter({ selected, onChange, properties }: DistrictFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Get count of properties in each district
  const districtCounts = useMemo(() => {
    return properties.reduce((acc, property) => {
      if (property.district) {
        acc[property.district] = (acc[property.district] || 0) + 1
      }
      return acc
    }, {} as Record<number, number>)
  }, [properties])

  // Group districts by region
  const groupedDistricts = useMemo(() => {
    return regions.reduce((acc, region) => {
      acc[region] = districtData.filter(d => d.region === region)
      return acc
    }, {} as Record<Region, typeof districtData>)
  }, [])

  // Calculate region states
  const regionStates = useMemo(() => {
    return regions.reduce((acc, region) => {
      const regionDistricts = groupedDistricts[region].map(d => d.id)
      const selectedInRegion = regionDistricts.filter(id => selected.includes(id))
      
      acc[region] = {
        isSelected: selectedInRegion.length === regionDistricts.length,
        isPartiallySelected: selectedInRegion.length > 0 && selectedInRegion.length < regionDistricts.length
      }
      return acc
    }, {} as Record<Region, { isSelected: boolean; isPartiallySelected: boolean }>)
  }, [selected, groupedDistricts])

  // Filter districts based on search
  const filteredDistricts = useMemo(() => {
    if (!searchTerm) return groupedDistricts
    
    return regions.reduce((acc, region) => {
      acc[region] = groupedDistricts[region].filter(district => 
        district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `D${district.id}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
      return acc
    }, {} as Record<Region, typeof districtData>)
  }, [searchTerm, groupedDistricts])

  // Handle region toggle
  const handleRegionToggle = (region: Region) => {
    const regionDistricts = groupedDistricts[region].map(d => d.id)
    
    if (regionStates[region].isSelected) {
      // Deselect all districts in this region
      onChange(selected.filter(id => !regionDistricts.includes(id)))
    } else {
      // Select all districts in this region
      const newSelected = [...new Set([...selected, ...regionDistricts])]
      onChange(newSelected)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search input - more compact */}
      <div className="relative">
        <Search className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search districts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 h-7 text-sm"
        />
      </div>

      {/* Region toggle buttons */}
      <div className="flex flex-wrap gap-1.5">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => handleRegionToggle(region)}
            className={cn(
              "px-2 py-1 text-xs rounded-md border transition-colors",
              "hover:bg-muted",
              regionStates[region].isSelected && "bg-primary text-primary-foreground border-primary",
              regionStates[region].isPartiallySelected && "bg-muted border-muted-foreground",
              !regionStates[region].isSelected && !regionStates[region].isPartiallySelected && 
                "text-muted-foreground border-transparent"
            )}
          >
            {region}
          </button>
        ))}
      </div>

      {/* District list */}
      <ScrollArea className="h-[280px] pr-4">
        <div className="space-y-4">
          {regions.map(region => (
            <div key={region} className="space-y-1">
              {filteredDistricts[region]?.length > 0 && (
                <>
                  <h4 className="text-[11px] font-medium text-muted-foreground">{region}</h4>
                  <div className="space-y-1">
                    {filteredDistricts[region].map(district => (
                      <DistrictCheckbox
                        key={district.id}
                        district={district}
                        checked={selected.includes(district.id)}
                        onChange={(checked) => {
                          if (checked) {
                            onChange([...selected, district.id])
                          } else {
                            onChange(selected.filter(id => id !== district.id))
                          }
                        }}
                        propertyCount={districtCounts[district.id] || 0}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 