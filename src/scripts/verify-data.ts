import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import dotenv from 'dotenv'
import type { Database } from '@/types/database'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyData() {
  console.log('Starting data verification...')

  // Get total count first
  const { count, error: countError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    throw new Error(`Failed to get count: ${countError.message}`)
  }

  console.log(`Database total count: ${count}`)

  // Get records in batches to avoid memory issues
  const BATCH_SIZE = 1000
  let offset = 0
  const allDbRecords: any[] = []

  while (true) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .range(offset, offset + BATCH_SIZE - 1)

    if (error) {
      throw new Error(`Failed to fetch records: ${error.message}`)
    }

    if (!data || data.length === 0) break

    allDbRecords.push(...data)
    offset += BATCH_SIZE

    console.log(`Fetched ${allDbRecords.length} of ${count} records...`)
  }

  // Read and validate CSV - use the fixed CSV file
  console.log('\nValidating CSV data...')
  const csvPath = path.join(process.cwd(), 'src/data/properties_fixed.csv')
  const csvContent = fs.readFileSync(csvPath)
  const csvRecords = parse(csvContent, { 
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  console.log(`\nSummary:`)
  console.log(`CSV records: ${csvRecords.length}`)
  console.log(`Database records: ${allDbRecords.length}`)

  if (csvRecords.length !== allDbRecords.length) {
    throw new Error(`Record count mismatch: CSV=${csvRecords.length}, DB=${allDbRecords.length}`)
  }

  // Create a map of database records for faster lookup
  const dbMap = new Map(allDbRecords.map(r => [r.id, r]))

  // Verify all CSV records exist in database
  console.log('\nVerifying records...')
  let verifiedCount = 0

  for (const csvRecord of csvRecords) {
    const dbRecord = dbMap.get(csvRecord.id)
    if (!dbRecord) {
      throw new Error(`Record ${csvRecord.id} not found in database!`)
    }

    // Verify key fields
    const fieldsToCheck = ['property_name', 'property_type', 'rental_price', 'sqft']
    for (const field of fieldsToCheck) {
      const csvValue = typeof csvRecord[field] === 'string' ? csvRecord[field].trim() : csvRecord[field]
      const dbValue = typeof dbRecord[field] === 'string' ? dbRecord[field].trim() : dbRecord[field]
      
      if (csvValue != dbValue) {
        throw new Error(`Mismatch in ${field} for record ${csvRecord.id}`)
      }
    }

    verifiedCount++
    if (verifiedCount % 1000 === 0) {
      console.log(`Verified ${verifiedCount} records...`)
    }
  }

  console.log(`\n✅ All ${verifiedCount} records verified successfully!`)
}

// Run verification
verifyData()
  .then(() => console.log('All checks passed!'))
  .catch(error => {
    console.error('Verification failed:', error)
    process.exit(1)
  }) 