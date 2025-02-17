import { supabase } from '@/lib/supabase/server'
import propertiesToFix from '@/data/cleaned-properties.json'

async function updateDistrictFixes() {
  console.log('Starting district fixes...\n')
  console.log(`Found ${propertiesToFix.length} properties to update`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const property of propertiesToFix) {
    const districtNumber = parseInt(property.district.replace('D', ''))
    
    // First get all instances of this property
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, property_name, district')
      .eq('property_name', property.name)

    if (fetchError) {
      console.error(`❌ Error fetching ${property.name}:`, fetchError.message)
      errorCount++
      continue
    }

    if (!properties.length) {
      console.log(`⚠️ Property not found: ${property.name}`)
      errorCount++
      continue
    }

    // Update each instance
    for (const instance of properties) {
      if (instance.district === districtNumber) {
        console.log(`⏭️ ${property.name} already has correct district ${districtNumber}`)
        skipCount++
        continue
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update({ district: districtNumber })
        .eq('id', instance.id)

      if (updateError) {
        console.error(`❌ Failed to update ${property.name}:`, updateError.message)
        errorCount++
      } else {
        console.log(`✅ Updated ${property.name} from ${instance.district || 'null'} to ${districtNumber}`)
        successCount++
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Print summary
  console.log('\n=== Update Summary ===')
  console.log(`✅ Successfully updated: ${successCount}`)
  console.log(`⏭️ Already correct: ${skipCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`Total properties processed: ${propertiesToFix.length}`)
}

// Run updates
console.log('Starting update process...')
updateDistrictFixes()
  .then(() => console.log('\nUpdate process completed'))
  .catch(error => console.error('Update process failed:', error))
