import { createClient } from '@supabase/supabase-js'
import { config } from './config'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import type { Property } from '@/types/property'

interface ProcessedProperty {
  property_name: string
  property_type: 'Condo' | 'HDB' | 'Landed'
  district: number
  rental_price: number
  beds: number
  sqft: number
  street_name: string
  lease_date: string
}

async function importGovData() {
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  // Read processed data
  const properties = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'src/data/processed-properties.json'),
      'utf-8'
    )
  ) as ProcessedProperty[]

  console.log(`Importing ${properties.length} properties...`)

  // First backup existing data
  const { data: existingData, error: backupError } = await supabase
    .from('properties')
    .select('*')

  if (backupError) {
    console.error('Failed to backup existing data:', backupError)
    return
  }

  // Save backup
  fs.writeFileSync(
    path.join(process.cwd(), 'src/data/properties-backup.json'),
    JSON.stringify(existingData, null, 2)
  )

  // Clear existing data
  const { error: deleteError } = await supabase
    .from('properties')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('Failed to clear existing data:', deleteError)
    return
  }

  // Add generated UUID and required fields to each property
  const propertiesWithIds = properties.map((property: ProcessedProperty) => ({
    ...property,
    id: crypto.randomUUID(),
    baths: null,
    mrt: null,
    latitude: 0, // We'll update these later
    longitude: 0,
    completion_year: null,
    url: '',
    created_at: new Date().toISOString()
  }))

  // Import new data in batches
  const batchSize = 100
  for (let i = 0; i < propertiesWithIds.length; i += batchSize) {
    const batch = propertiesWithIds.slice(i, i + batchSize)
    const { error: insertError } = await supabase
      .from('properties')
      .insert(batch)

    if (insertError) {
      console.error(`Failed to insert batch ${i/batchSize + 1}:`, insertError)
      console.error('Error details:', insertError)
      return
    }

    console.log(`Imported batch ${i/batchSize + 1} of ${Math.ceil(propertiesWithIds.length/batchSize)}`)
  }

  console.log('Import complete!')
}

importGovData() 