import { supabase } from '@/lib/supabase/server'

const propertiesToFix = [
  { name: 'Mandarin Gardens', district: 15, reason: 'Located in East Coast/Marine Parade' },
  { name: 'The Hillier', district: 23, reason: 'Located in Hillview area, Bukit Batok' }
]

async function fixRemainingDistricts() {
  console.log('Starting to fix remaining districts...\n')

  for (const property of propertiesToFix) {
    console.log(`Fixing ${property.name}:`)
    console.log(`Reason: ${property.reason}`)

    const { data: instances, error: fetchError } = await supabase
      .from('properties')
      .select('id, property_name, district')
      .eq('property_name', property.name)

    if (fetchError) {
      console.error(`❌ Error fetching ${property.name}:`, fetchError.message)
      continue
    }

    if (!instances?.length) {
      console.log(`⚠️ Property not found: ${property.name}\n`)
      continue
    }

    for (const instance of instances) {
      if (instance.district === property.district) {
        console.log(`⏭️ Instance already has correct district ${property.district}`)
        continue
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update({ district: property.district })
        .eq('id', instance.id)

      if (updateError) {
        console.error(`❌ Failed to update:`, updateError.message)
      } else {
        console.log(`✅ Updated from district ${instance.district} to ${property.district}`)
      }
    }
    console.log('')
  }

  // Verify all updates
  console.log('\n=== Verification of All Districts ===')
  const { data: properties, error: verifyError } = await supabase
    .from('properties')
    .select('property_name, district')
    .in('property_name', propertiesToFix.map(p => p.name))

  if (verifyError) {
    console.error('Error during verification:', verifyError.message)
    return
  }

  properties?.forEach(property => {
    const expected = propertiesToFix.find(p => p.name === property.property_name)
    const status = property.district === expected?.district ? '✅' : '❌'
    console.log(`${status} ${property.property_name}: District ${property.district}`)
  })

  // Show overall district statistics
  const { data: stats } = await supabase
    .from('properties')
    .select('district')

  if (stats) {
    const districts = new Set(stats.map(p => p.district).filter(Boolean))
    console.log('\n=== District Statistics ===')
    console.log(`Total properties: ${stats.length}`)
    console.log(`Properties with districts: ${stats.filter(p => p.district).length}`)
    console.log(`Properties without districts: ${stats.filter(p => !p.district).length}`)
    console.log(`Unique districts: ${districts.size}`)
  }
}

console.log('Starting fix and verification process...')
fixRemainingDistricts()
  .then(() => console.log('\nProcess completed'))
  .catch(error => console.error('Process failed:', error)) 