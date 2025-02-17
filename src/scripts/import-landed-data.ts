import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Ensure dotenv is loading from the right path
dotenv.config({ path: path.join(process.cwd(), '.env') })

// Debug environment variables
console.log('Checking environment variables...')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

interface LandedProperty {
  'Project Name': string
  'Property Type': string
  'Monthly Rent ($)': string
  'Floor Area (SQFT)': string
  'Postal District': string
  'Street Name': string
  'Lease Commencement Date': string
  estimated_bedrooms: number
}

function getSqft(sqftRange: string): number {
  // Convert "2,000 to 2,500" -> 2500
  const [_, maxSqft] = sqftRange
    .replace(/,/g, '')
    .split(' to ')
    .map(Number)
  return maxSqft
}

async function importLandedData() {
  // Read the enriched landed data
  const landedData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'src/data/landed-with-bedrooms.json'), 'utf-8')
  ) as LandedProperty[]

  // Format data for database
  const formattedData = landedData.map(prop => ({
    property_name: prop['Project Name'].trim(),
    property_type: 'Landed',
    district: parseInt(prop['Postal District']),
    rental_price: parseInt(prop['Monthly Rent ($)'].replace(/,/g, '')),
    beds: prop.estimated_bedrooms,
    sqft: getSqft(prop['Floor Area (SQFT)']),
    street_name: prop['Street Name'].trim(),
    lease_date: prop['Lease Commencement Date']
  }))

  // Insert data in batches
  const BATCH_SIZE = 100
  console.log(`Importing ${formattedData.length} landed properties...`)

  for (let i = 0; i < formattedData.length; i += BATCH_SIZE) {
    const batch = formattedData.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('properties')
      .insert(batch)

    if (error) {
      console.error('Error inserting batch:', error)
      process.exit(1)
    }

    console.log(`Imported ${i + batch.length} of ${formattedData.length} properties`)
  }

  console.log('Import complete!')
}

importLandedData() 