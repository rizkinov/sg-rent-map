import { createClient } from '@supabase/supabase-js'
import { config } from './config'

async function runMigration() {
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  console.log('Running migration...')

  // First verify table exists
  const { data: tableCheck, error: tableError } = await supabase
    .from('properties')
    .select('id')
    .limit(1)

  if (tableError) {
    console.error('Error checking table:', tableError)
    return
  }

  // Add columns using REST API
  const response = await fetch(`${config.supabaseUrl}/rest/v1/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': config.supabaseAnonKey!,
      'Authorization': `Bearer ${config.supabaseServiceKey!}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      street_name: null,
      lease_date: null
    })
  }).then(r => r.json())

  if (response.error) {
    console.error('Error adding columns:', response.error)
    return
  }

  // Verify columns were added
  const { data: columnCheck, error: columnError } = await supabase
    .from('properties')
    .select('street_name, lease_date')
    .limit(1)

  if (columnError) {
    console.error('Error verifying columns:', columnError)
    return
  }

  console.log('Migration complete! New columns verified.')
}

runMigration().catch(console.error) 