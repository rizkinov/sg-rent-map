import { supabase } from '@/lib/supabase/server'
import propertiesToUpdate from '@/data/cleaned-properties.json'

const BATCH_SIZE = 10 // Number of properties to process in each batch

async function updateDistricts() {
  let successCount = 0
  let failureCount = 0
  let skippedCount = 0
  
  console.log(`Starting to update ${propertiesToUpdate.length} properties...`)

  // Process properties in batches
  for (let i = 0; i < propertiesToUpdate.length; i += BATCH_SIZE) {
    const batch = propertiesToUpdate.slice(i, i + BATCH_SIZE)
    console.log(`\nProcessing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(propertiesToUpdate.length/BATCH_SIZE)}`)

    // First get all existing properties in this batch
    const propertyNames = batch.map(p => p.name)
    const { data: existingProperties } = await supabase
      .from('properties')
      .select('id, property_name, district')
      .in('property_name', propertyNames)

    if (!existingProperties) {
      console.error('❌ Failed to fetch existing properties')
      continue
    }

    // Create a map for quick lookup
    const existingPropertiesMap = new Map(
      existingProperties.map(p => [p.property_name, p])
    )

    // Prepare updates
    const updates = batch.map(property => {
      const existing = existingPropertiesMap.get(property.name)
      const districtNumber = parseInt(property.district.replace('D', ''))

      if (!existing) {
        console.error(`❌ Property not found: ${property.name}`)
        failureCount++
        return null
      }

      if (existing.district === districtNumber) {
        console.log(`⏭️  ${property.name} already has district ${districtNumber}`)
        skippedCount++
        return null
      }

      return {
        id: existing.id,
        property_name: property.name,
        districtNumber
      }
    }).filter(Boolean)

    // Process valid updates
    if (updates.length > 0) {
      for (const update of updates) {
        const { error } = await supabase
          .from('properties')
          .update({ district: update!.districtNumber })
          .eq('id', update!.id)

        if (error) {
          console.error(`❌ Failed to update ${update!.property_name}:`, error.message)
          failureCount++
        } else {
          console.log(`✅ Updated ${update!.property_name} to district ${update!.districtNumber}`)
          successCount++
        }
      }
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\nUpdate Summary:')
  console.log(`✅ Successfully updated: ${successCount}`)
  console.log(`⏭️  Skipped (already correct): ${skippedCount}`)
  console.log(`❌ Failed updates: ${failureCount}`)
  console.log(`Total processed: ${propertiesToUpdate.length}`)
}

// Run the update
console.log('Starting district update process...')
updateDistricts()
  .then(() => console.log('Update process completed'))
  .catch(error => console.error('Update process failed:', error)) 