import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import type { Database } from '@/types/database'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const BATCH_SIZE = 1000

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Required environment variables are missing')
}

async function importProperties() {
  console.log('Starting property import...')

  const supabase = createClient<Database>(
    supabaseUrl as string,
    supabaseKey as string
  )

  // First, clear existing data
  console.log('Clearing existing data...')
  const { error: clearError } = await supabase
    .rpc('truncate_properties')

  if (clearError) {
    throw new Error(`Failed to clear existing data: ${clearError.message}`)
  }

  // Read and parse CSV
  const csvPath = path.join(process.cwd(), 'src/data/properties_fixed.csv')
  const records: any[] = []
  let skippedCount = 0
  let importedCount = 0
  let skipReasons: Record<string, number> = {
    'Missing ID': 0,
    'Missing Property Name': 0,
    'Missing Rental Price': 0,
    'Missing Sqft': 0
  }
  
  const parser = fs
    .createReadStream(csvPath)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }))

  for await (const record of parser) {
    // Skip records with empty or invalid IDs
    if (!record.id || record.id.trim() === '') {
      skipReasons['Missing ID']++
      skippedCount++
      continue
    }

    // Log specific missing fields
    if (!record.property_name) {
      skipReasons['Missing Property Name']++
      skippedCount++
      continue
    }
    if (!record.rental_price) {
      skipReasons['Missing Rental Price']++
      skippedCount++
      continue
    }
    if (!record.sqft) {
      skipReasons['Missing Sqft']++
      skippedCount++
      continue
    }

    records.push({
      id: record.id,
      property_name: record.property_name,
      property_type: record.property_type,
      district: parseInt(record.district) || null,
      rental_price: parseInt(record.rental_price),
      beds: parseInt(record.beds) || null,
      baths: parseInt(record.baths) || null,
      sqft: parseFloat(record.sqft),
      mrt: record.mrt || null,
      latitude: parseFloat(record.latitude) || 0,
      longitude: parseFloat(record.longitude) || 0,
      street_name: record.street_name || null,
      lease_date: record.lease_date || null,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString()
    })

    // Import in batches
    if (records.length >= BATCH_SIZE) {
      await importBatch(supabase, records)
      importedCount += records.length
      console.log(`Progress: ${importedCount} records imported, ${skippedCount} skipped`)
      records.length = 0 // Clear array
    }
  }

  // Import remaining records
  if (records.length > 0) {
    await importBatch(supabase, records)
    importedCount += records.length
  }

  console.log('\nImport Summary:')
  console.log(`✅ Successfully imported: ${importedCount} records`)
  console.log(`⚠️ Skipped: ${skippedCount} records`)
  console.log('\nSkip Reasons:')
  Object.entries(skipReasons).forEach(([reason, count]) => {
    if (count > 0) {
      console.log(`${reason}: ${count} records`)
    }
  })
  console.log(`\nTotal processed: ${importedCount + skippedCount} records`)
}

async function importBatch(supabase: any, records: any[]) {
  try {
    const { error } = await supabase
      .from('properties')
      .insert(records) // Changed from upsert to insert since we cleared the data

    if (error) {
      console.error('Error importing batch:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to import batch:', error)
    // Log the first record of the failing batch to help debug
    if (records.length > 0) {
      console.error('Sample record:', records[0])
    }
    throw error
  }
}

// Run import
console.log('Starting import process...')
importProperties()
  .then(() => console.log('Import completed successfully'))
  .catch(error => {
    console.error('Import failed:', error)
    process.exit(1)
  }) 