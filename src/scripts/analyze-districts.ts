import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { PropertyType } from '@/types/property'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DistrictStats {
  total: number
  avgPrice: number
  propertyTypes: Record<PropertyType, number>
  priceRange: {
    min: number
    max: number
  }
  avgSize: number
}

async function analyzeDistricts() {
  try {
    // Get all districts
    const { data: districts, error: districtError } = await supabase
      .from('districts')
      .select('id, name')
      .order('id')

    if (districtError) throw districtError

    // Get property stats for each district
    const districtStats = new Map<number, DistrictStats>()

    for (const district of districts) {
      const { data: properties, error: propertyError } = await supabase
        .from('properties')
        .select('rental_price, property_type, sqft')
        .eq('district', district.id)

      if (propertyError) {
        console.error(`Error fetching properties for District ${district.id}:`, propertyError)
        continue
      }

      if (!properties.length) continue

      // Calculate statistics
      const stats: DistrictStats = {
        total: properties.length,
        avgPrice: Math.round(
          properties.reduce((sum, p) => sum + p.rental_price, 0) / properties.length
        ),
        propertyTypes: {
          Condo: properties.filter(p => p.property_type === 'Condo').length,
          HDB: properties.filter(p => p.property_type === 'HDB').length,
          Landed: properties.filter(p => p.property_type === 'Landed').length
        },
        priceRange: {
          min: Math.min(...properties.map(p => p.rental_price)),
          max: Math.max(...properties.map(p => p.rental_price))
        },
        avgSize: Math.round(
          properties.reduce((sum, p) => sum + p.sqft, 0) / properties.length
        )
      }

      districtStats.set(district.id, stats)

      // Print district summary
      console.log(`\nDistrict ${district.id} (${district.name}):`)
      console.log(`Total properties: ${stats.total}`)
      console.log(`Average rental: $${stats.avgPrice.toLocaleString()}`)
      console.log('Property types:')
      Object.entries(stats.propertyTypes).forEach(([type, count]) => {
        if (count > 0) {
          console.log(`  - ${type}: ${count} (${Math.round(count/stats.total*100)}%)`)
        }
      })
      console.log(`Price range: $${stats.priceRange.min.toLocaleString()} - $${stats.priceRange.max.toLocaleString()}`)
      console.log(`Average size: ${stats.avgSize} sqft`)
    }

    // Print overall statistics
    console.log('\n=== Overall Statistics ===')
    const totalProperties = Array.from(districtStats.values())
      .reduce((sum, stats) => sum + stats.total, 0)
    const overallAvgPrice = Math.round(
      Array.from(districtStats.values())
        .reduce((sum, stats) => sum + stats.avgPrice * stats.total, 0) / totalProperties
    )
    const propertyTypeTotals = Array.from(districtStats.values()).reduce(
      (acc, stats) => {
        Object.entries(stats.propertyTypes).forEach(([type, count]) => {
          acc[type as PropertyType] = (acc[type as PropertyType] || 0) + count
        })
        return acc
      },
      {} as Record<PropertyType, number>
    )

    console.log(`Total properties: ${totalProperties.toLocaleString()}`)
    console.log(`Overall average rental: $${overallAvgPrice.toLocaleString()}`)
    console.log('\nProperty type distribution:')
    Object.entries(propertyTypeTotals).forEach(([type, count]) => {
      console.log(`${type}: ${count.toLocaleString()} (${Math.round(count/totalProperties*100)}%)`)
    })

  } catch (error) {
    console.error('Analysis failed:', error)
  }
}

console.log('Starting district analysis...')
analyzeDistricts()
  .then(() => console.log('\nAnalysis completed'))
  .catch(error => console.error('Analysis failed:', error)) 