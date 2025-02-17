import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { PropertyRecord } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PropertyOverride {
  name: string
  district: number
  reason: string
}

// Specific property overrides with known districts
const specificOverrides: PropertyOverride[] = [
  { name: 'teban gardens', district: 22, reason: 'Located in Jurong East' },
  { name: 'leonie condotel', district: 9, reason: 'Located in River Valley' },
  { name: 'leonie towers', district: 9, reason: 'Located in River Valley' },
  { name: 'watermark robertson', district: 9, reason: 'Located near Robertson Quay' },
  { name: 'mandarin gardens', district: 15, reason: 'Located in East Coast' },
  { name: 'the hillier', district: 23, reason: 'Located in Hillview' },
  { name: 'costa rhu', district: 15, reason: 'Located in Tanjong Rhu' }
]

async function applyDistrictSuggestions() {
  console.log('Fetching properties without districts...\n')

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, property_name, district')
    .is('district', null)

  if (error) {
    console.error('Error fetching properties:', error.message)
    return
  }

  console.log(`Found ${properties.length} properties without districts\n`)

  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const property of properties) {
    const propertyName = property.property_name.toLowerCase()
    const override = specificOverrides.find(o => propertyName.includes(o.name))

    if (override) {
      try {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ district: override.district })
          .eq('id', property.id)

        if (updateError) {
          console.error(`Error updating ${property.property_name}:`, updateError.message)
          errorCount++
          continue
        }

        console.log(`✅ Updated ${property.property_name} to District ${override.district}`)
        console.log(`   Reason: ${override.reason}\n`)
        updatedCount++
      } catch (error) {
        console.error(`Failed to update ${property.property_name}:`, error)
        errorCount++
      }
    } else {
      skippedCount++
    }
  }

  // Print summary
  console.log('\n=== Update Summary ===')
  console.log(`✅ Updated: ${updatedCount}`)
  console.log(`⏭️  Skipped: ${skippedCount}`)
  console.log(`❌ Failed updates: ${errorCount}`)
  console.log(`Total properties processed: ${properties.length}`)
}

console.log('Starting to apply district updates...')
applyDistrictSuggestions()
  .then(() => console.log('\nUpdate process completed'))
  .catch(error => console.error('Update process failed:', error)) 