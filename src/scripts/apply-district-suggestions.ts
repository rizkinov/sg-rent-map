import { supabase } from '@/lib/supabase/server'

// Flatten all patterns into single key-value pairs
const specificOverrides = {
  // Previous matches
  'teban gardens': 22,
  'leonie condotel': 9,
  'leonie towers': 9,
  'watermark robertson': 9,
  'eon shenton': 2,
  'marine terrace': 15,
  'hume park': 21,
  'yuan ching': 22,
  'sixth avenue': 10,
  'nassim park': 10,
  'holland mews': 10,

  // Roads and locations
  'thomson road': 11,
  'balestier road': 12,
  'geylang road': 14,
  'marine parade road': 15,
  'east coast road': 15,
  'bedok road': 16,
  'upper changi road': 16,
  'serangoon road': 19,
  'ang mo kio': 20,
  'bukit timah road': 10,
  'holland road': 10,

  // Residences
  'woodleigh residences': 13,
  'bartley residences': 13,
  'thomson residences': 11,
  'newton residences': 11,
  'river valley residences': 9,

  // Additional common words
  'suites': 9,
  'condominium': 10,
  'park': 10,
  'gardens': 10,
  'ville': 10,
  'view': 23,
  'heights': 23,
  'green': 23,
  'loft': 12,
  'edge': 11,
  'hill': 23,
  
  // HDB areas
  'segar': 23,
  'fernvale': 19,
  'compassvale': 19,
  'rivervale': 19,
  'anchorvale': 19,
  'edgefield': 19,
  'senja': 23,
  'pending': 23,
  'bangkit': 23,
  'fajar': 23,
  'gangsa': 25,
  'woodlands': 25,
  'marsiling': 25,
  'yishun': 27,
  'sembawang': 27,

  // Specific locations
  'fourth avenue': 10,
  'seaside': 15,
  'jupiter': 10,
  'sennett': 13,

  // Fallback areas
  'central': 9,
  'north': 25,
  'south': 4,
  'east': 15,
  'west': 22
}

async function applyDistrictSuggestions() {
  console.log('Starting district updates...\n')

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, property_name, district')
    .is('district', null)

  if (error) {
    console.error('Error fetching properties:', error.message)
    return
  }

  let successCount = 0
  let errorCount = 0
  let skippedCount = 0

  for (const property of properties) {
    const name = property.property_name.toLowerCase()
    let districtToApply = null
    let confidence = 'high'

    // Check specific overrides first
    for (const [pattern, district] of Object.entries(specificOverrides)) {
      if (name.includes(pattern.toLowerCase())) {
        districtToApply = district
        break
      }
    }

    // Fallback logic for remaining properties
    if (!districtToApply) {
      confidence = 'low'
      if (name.match(/^\d+[a-z]?\s/)) {
        // HDB-style naming (starts with block number)
        districtToApply = 19 // Default to Serangoon/Hougang area
      } else if (name.includes('condo') || name.includes('apartment')) {
        districtToApply = 10 // Default to Bukit Timah area
      } else {
        districtToApply = 10 // Default fallback
      }
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update({ district: districtToApply })
      .eq('id', property.id)

    if (updateError) {
      console.error(`❌ Failed to update ${property.property_name}:`, updateError.message)
      errorCount++
    } else {
      console.log(`${confidence === 'high' ? '✅' : '⚠️'} Updated ${property.property_name} to District ${districtToApply} (${confidence})`)
      successCount++
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n=== Update Summary ===')
  console.log(`✅ Successfully updated: ${successCount}`)
  console.log(`⏭️  Skipped: ${skippedCount}`)
  console.log(`❌ Failed updates: ${errorCount}`)
  console.log(`Total properties processed: ${properties.length}`)
}

console.log('Starting to apply district updates...')
applyDistrictSuggestions()
  .then(() => console.log('\nUpdate process completed'))
  .catch(error => console.error('Update process failed:', error)) 