import { createClient } from '@supabase/supabase-js'
import { districtData, District } from '@/data/districts/singapore-districts'
import { config } from './config'

interface Property {
  id: string
  district: number | null
  latitude: number
  longitude: number
}

async function addCoordinates() {
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  console.log('Fetching properties...')
  const { data: properties, error: fetchError } = await supabase
    .from('properties')
    .select('id, district')
    .is('latitude', null) // Only update properties without coordinates
  
  if (fetchError) {
    console.error('Error fetching properties:', fetchError)
    return
  }

  console.log(`Adding coordinates to ${properties.length} properties...`)
  let updated = 0

  // Update in batches
  const batchSize = 50
  const batches = Math.ceil(properties.length / batchSize)

  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize)
    const updates = batch.map(property => {
      if (!property.district) return null
      
      const district = districtData.find(d => d.id === property.district)
      if (!district) return null

      const latVariation = (Math.random() - 0.5) * 0.01
      const lngVariation = (Math.random() - 0.5) * 0.01

      return {
        id: property.id,
        latitude: district.center.lat + latVariation,
        longitude: district.center.lng + lngVariation
      }
    }).filter(Boolean)

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('properties')
        .upsert(updates)

      if (updateError) {
        console.error(`Error updating batch ${i/batchSize + 1}:`, updateError)
      } else {
        updated += updates.length
        console.log(`Updated batch ${i/batchSize + 1} of ${batches} (${updated} total)`)
      }
    }
  }

  console.log(`Successfully updated ${updated} properties`)
}

addCoordinates().catch(console.error) 