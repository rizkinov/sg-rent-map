import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { PropertyRecord } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PropertyFix {
  name: string
  district: number
  reason: string
}

interface DistrictStat {
  property_name: string
  district: number | null
  property_type: string
}

// Known properties that need fixing
const propertiesToFix: PropertyFix[] = [
  { name: 'Mandarin Gardens', district: 15, reason: 'Located in East Coast/Marine Parade' },
  { name: 'The Hillier', district: 23, reason: 'Located in Hillview area, Bukit Batok' }
]

async function fixRemainingDistricts() {
  console.log('Starting to fix remaining districts...\n')

  let updatedCount = 0
  let errorCount = 0

  // Update each property
  for (const fix of propertiesToFix) {
    try {
      const { data: properties, error: fetchError } = await supabase
        .from('properties')
        .select('id, property_name, district')
        .ilike('property_name', `%${fix.name}%`)

      if (fetchError) {
        console.error(`Error fetching ${fix.name}:`, fetchError.message)
        errorCount++
        continue
      }

      if (!properties.length) {
        console.log(`⚠️  No properties found matching "${fix.name}"`)
        continue
      }

      for (const property of properties) {
        if (property.district === fix.district) {
          console.log(`✓ ${property.property_name} already has correct district ${fix.district}`)
          continue
        }

        const { error: updateError } = await supabase
          .from('properties')
          .update({ district: fix.district })
          .eq('id', property.id)

        if (updateError) {
          console.error(`Error updating ${property.property_name}:`, updateError.message)
          errorCount++
          continue
        }

        console.log(`✅ Updated ${property.property_name} to District ${fix.district}`)
        console.log(`   Reason: ${fix.reason}\n`)
        updatedCount++
      }
    } catch (error) {
      console.error(`Error processing ${fix.name}:`, error)
      errorCount++
    }
  }

  // Verify the current state
  try {
    // Get district statistics
    const { data: stats, error: statsError } = await supabase
      .from('properties')
      .select('property_name, district, property_type')

    if (statsError) throw statsError

    const districts = new Set(stats.map(p => p.district).filter(Boolean))
    
    console.log('\n=== District Statistics ===')
    console.log(`Total properties: ${stats.length}`)
    console.log(`Properties with districts: ${stats.filter(p => p.district).length}`)
    console.log(`Properties without districts: ${stats.filter(p => !p.district).length}`)
    console.log(`Unique districts: ${districts.size}`)

    // List properties still missing districts
    const missingDistricts = stats.filter(p => !p.district)
    if (missingDistricts.length > 0) {
      console.log('\nProperties still missing districts:')
      missingDistricts.forEach(p => {
        console.log(`- ${p.property_name} (${p.property_type})`)
      })
    }

  } catch (error) {
    console.error('Error verifying districts:', error)
  }

  // Print summary
  console.log('\n=== Update Summary ===')
  console.log(`✅ Successfully updated: ${updatedCount}`)
  console.log(`❌ Errors encountered: ${errorCount}`)
}

console.log('Starting fix and verification process...')
fixRemainingDistricts()
  .then(() => console.log('\nProcess completed'))
  .catch(error => console.error('Process failed:', error)) 