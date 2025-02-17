import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateInBatches(properties: string[], type: 'Condo' | 'HDB') {
  const BATCH_SIZE = 50 // Smaller batch size to avoid request limits
  
  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('properties')
      .update({ property_type: type })
      .in('property_name', batch)

    if (error) {
      console.error(`Error updating batch ${i}-${i + batch.length}:`, error)
      process.exit(1)
    }

    console.log(`Updated ${i + batch.length} of ${properties.length} ${type} properties`)
  }
}

async function updatePropertyTypes() {
  // Read our categorization results
  const likelyCondos = fs.readFileSync(path.join(process.cwd(), 'src/data/likely-condos.txt'), 'utf-8')
    .split('\n')
    .filter(Boolean)
  
  const likelyHDB = fs.readFileSync(path.join(process.cwd(), 'src/data/likely-hdb.txt'), 'utf-8')
    .split('\n')
    .filter(Boolean)

  // Update Condos
  console.log(`\nUpdating ${likelyCondos.length} Condo properties...`)
  await updateInBatches(likelyCondos, 'Condo')

  // Update HDB
  console.log(`\nUpdating ${likelyHDB.length} HDB properties...`)
  await updateInBatches(likelyHDB, 'HDB')

  console.log('\nProperty types updated successfully!')
}

updatePropertyTypes() 