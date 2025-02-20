import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import type { Database } from '@/types/database'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PropertyStats {
  property_type: string
  sqft: number
  rental_price: number
  beds: number | null
}

interface RangeStats {
  min: number
  max: number
  sum: number
  count: number
}

interface TypeStats {
  sqftRanges: Map<number, RangeStats>
  priceRanges: Map<number, RangeStats>
  counts: Map<number, number>
}

async function estimateBedrooms() {
  console.log('Starting bedroom estimation process...\n')

  // First, get reference data from properties with known bedrooms
  const { data: referenceData, error: refError } = await supabase
    .from('properties')
    .select('property_type, sqft, rental_price, beds')
    .not('beds', 'is', null)

  if (refError || !referenceData) {
    throw new Error(`Failed to fetch reference data: ${refError?.message}`)
  }

  // Build reference statistics
  const typeStats = new Map<string, TypeStats>()
  
  for (const prop of referenceData) {
    if (!typeStats.has(prop.property_type)) {
      typeStats.set(prop.property_type, {
        sqftRanges: new Map(),
        priceRanges: new Map(),
        counts: new Map()
      })
    }

    const stats = typeStats.get(prop.property_type)!
    const beds = prop.beds!

    // Update sqft ranges
    if (!stats.sqftRanges.has(beds)) {
      stats.sqftRanges.set(beds, { min: Infinity, max: -Infinity, sum: 0, count: 0 })
    }
    const sqftRange = stats.sqftRanges.get(beds)!
    sqftRange.min = Math.min(sqftRange.min, prop.sqft)
    sqftRange.max = Math.max(sqftRange.max, prop.sqft)
    sqftRange.sum += prop.sqft
    sqftRange.count++

    // Update price ranges
    if (!stats.priceRanges.has(beds)) {
      stats.priceRanges.set(beds, { min: Infinity, max: -Infinity, sum: 0, count: 0 })
    }
    const priceRange = stats.priceRanges.get(beds)!
    priceRange.min = Math.min(priceRange.min, prop.rental_price)
    priceRange.max = Math.max(priceRange.max, prop.rental_price)
    priceRange.sum += prop.rental_price
    priceRange.count++

    // Update counts
    stats.counts.set(beds, (stats.counts.get(beds) || 0) + 1)
  }

  // Now get properties with missing bedrooms
  const { data: missingBeds, error: fetchError } = await supabase
    .from('properties')
    .select('id, property_type, sqft, rental_price, beds')
    .is('beds', null)

  if (fetchError || !missingBeds) {
    throw new Error(`Failed to fetch properties: ${fetchError?.message}`)
  }

  console.log(`Found ${missingBeds.length} properties with missing bedroom data`)

  let updateCount = 0
  let errorCount = 0

  // Process each property
  for (const property of missingBeds) {
    try {
      const propertyStats = typeStats.get(property.property_type)
      if (!propertyStats) {
        console.warn(`No reference data for type: ${property.property_type}`)
        continue
      }

      // Calculate best match based on sqft and price
      let bestMatch = 0
      let bestScore = -Infinity

      for (const [beds, sqftRange] of propertyStats.sqftRanges) {
        const priceRange = propertyStats.priceRanges.get(beds)!
        
        // Calculate score based on how well the property matches the ranges
        const sqftScore = 1 - Math.abs(
          (property.sqft - (sqftRange.sum / sqftRange.count)) / 
          (sqftRange.max - sqftRange.min)
        )
        
        const priceScore = 1 - Math.abs(
          (property.rental_price - (priceRange.sum / priceRange.count)) / 
          (priceRange.max - priceRange.min)
        )

        // Weight sqft more heavily than price (60/40 split)
        const score = (sqftScore * 0.6) + (priceScore * 0.4)

        if (score > bestScore) {
          bestScore = score
          bestMatch = beds
        }
      }

      // Update the property with estimated bedrooms
      const { error: updateError } = await supabase
        .from('properties')
        .update({ beds: bestMatch || 2 }) // Default to 2 if no good match found
        .eq('id', property.id)

      if (updateError) {
        throw updateError
      }

      updateCount++
      if (updateCount % 100 === 0) {
        console.log(`Processed ${updateCount} properties...`)
      }

    } catch (error) {
      console.error(`Error processing property ${property.id}:`, error)
      errorCount++
    }
  }

  // Print summary statistics
  console.log('\n=== Estimation Summary ===')
  console.log(`✅ Successfully updated: ${updateCount} properties`)
  console.log(`❌ Failed updates: ${errorCount}`)
  console.log(`Total processed: ${missingBeds.length}`)

  // Print reference statistics used
  console.log('\n=== Reference Statistics ===')
  for (const [type, stats] of typeStats) {
    console.log(`\n${type}:`)
    for (const [beds, sqftRange] of stats.sqftRanges) {
      const priceRange = stats.priceRanges.get(beds)!
      console.log(`${beds} Bedrooms:`)
      console.log(`  Count: ${stats.counts.get(beds)}`)
      console.log(`  Avg sqft: ${Math.round(sqftRange.sum / sqftRange.count)}`)
      console.log(`  Avg price: $${Math.round(priceRange.sum / priceRange.count)}`)
    }
  }
}

// Run the estimation
console.log('Starting bedroom estimation...')
estimateBedrooms()
  .then(() => console.log('\nEstimation process completed'))
  .catch(error => {
    console.error('Estimation process failed:', error)
    process.exit(1)
  }) 