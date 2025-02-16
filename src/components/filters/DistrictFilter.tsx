import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"
import { districtData } from '@/data/districts/singapore-districts'
import type { Property } from '@/types/property'

interface DistrictFilterProps {
  selectedDistricts: number[]
  onChange: (districts: number[]) => void
  properties: Property[]
}

// Group districts by region
const groupedDistricts = districtData.reduce((acc, district) => {
  const region = district.region
  if (!acc[region]) {
    acc[region] = []
  }
  acc[region].push(district)
  return acc
}, {} as Record<string, typeof districtData>)

const regions = Object.keys(groupedDistricts)

export function DistrictFilter({ 
  selectedDistricts, 
  onChange,
  properties 
}: DistrictFilterProps) {
  const [search, setSearch] = useState("")

  const handleChange = (checked: boolean, districtId: number) => {
    if (checked) {
      onChange([...selectedDistricts, districtId])
    } else {
      onChange(selectedDistricts.filter(id => id !== districtId))
    }
  }

  const handleRegionSelect = (region: string) => {
    const regionDistricts = groupedDistricts[region].map(d => d.id)
    const isAllSelected = regionDistricts.every(id => selectedDistricts.includes(id))
    
    if (isAllSelected) {
      // Deselect all districts in this region
      onChange(selectedDistricts.filter(id => !regionDistricts.includes(id)))
    } else {
      // Select all districts in this region
      const newSelection = [...new Set([...selectedDistricts, ...regionDistricts])]
      onChange(newSelection)
    }
  }

  const filteredDistricts = search
    ? districtData.filter(district =>
        district.name.toLowerCase().includes(search.toLowerCase()) ||
        `D${district.id}`.includes(search)
      )
    : districtData

  const getDistrictPropertyCount = (district: typeof districtData[0]) => {
    return properties.filter(p => {
      const latDiff = Math.abs(district.center.lat - p.latitude)
      const lngDiff = Math.abs(district.center.lng - p.longitude)
      return latDiff < 0.02 && lngDiff < 0.02
    }).length
  }

  return (
    <div className="space-y-4">
      {/* Quick select buttons */}
      <div className="flex flex-wrap gap-2">
        {regions.map(region => {
          const regionDistricts = groupedDistricts[region].map(d => d.id)
          const isAllSelected = regionDistricts.every(id => selectedDistricts.includes(id))
          const hasSelected = regionDistricts.some(id => selectedDistricts.includes(id))
          
          return (
            <Button
              key={region}
              variant={isAllSelected ? "default" : hasSelected ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleRegionSelect(region)}
              className="h-7 text-xs"
            >
              {region}
            </Button>
          )
        })}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search districts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {/* District list */}
      <ScrollArea className="h-[300px] pr-4">
        {search ? (
          // Show flat list when searching
          <div className="space-y-3">
            {filteredDistricts.map(district => (
              <DistrictCheckbox
                key={district.id}
                district={district}
                checked={selectedDistricts.includes(district.id)}
                onChange={handleChange}
                propertyCount={getDistrictPropertyCount(district)}
              />
            ))}
          </div>
        ) : (
          // Show grouped list normally
          <div className="space-y-6">
            {regions.map(region => (
              <div key={region} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">{region}</h4>
                  <span className="text-xs text-muted-foreground">
                    {selectedDistricts.filter(id => 
                      groupedDistricts[region].some(d => d.id === id)
                    ).length} / {groupedDistricts[region].length}
                  </span>
                </div>
                <div className="space-y-3 pl-2">
                  {groupedDistricts[region].map(district => (
                    <DistrictCheckbox
                      key={district.id}
                      district={district}
                      checked={selectedDistricts.includes(district.id)}
                      onChange={handleChange}
                      propertyCount={getDistrictPropertyCount(district)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Extracted checkbox component for reuse
function DistrictCheckbox({ 
  district, 
  checked, 
  onChange,
  propertyCount,
}: { 
  district: (typeof districtData)[0]
  checked: boolean
  onChange: (checked: boolean, id: number) => void
  propertyCount: number
}) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id={`district-${district.id}`}
        checked={checked}
        onCheckedChange={(checked) => onChange(checked as boolean, district.id)}
      />
      <Label 
        htmlFor={`district-${district.id}`}
        className="text-sm leading-tight"
      >
        <div className="flex flex-col">
          <div>
            <span className="font-medium">D{district.id}</span>
            <span className="text-muted-foreground"> - {district.name}</span>
          </div>
          <div className="text-xs text-primary-foreground">
            {propertyCount} properties
          </div>
        </div>
      </Label>
    </div>
  )
} 