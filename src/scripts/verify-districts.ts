import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { PropertyRecord, DistrictRecord } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PropertyToCheck {
  name: string
  expectedDistrict: number
  location: string
}

async function verifyDistricts() {
  console.log('Starting district verification...\n')

  // Get total count first
  const { count: totalCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  console.log(`Total properties in database: ${totalCount}\n`)

  // Check for missing districts with pagination
  let allMissingDistricts: PropertyRecord[] = []
  let page = 0
  const pageSize = 1000

  while (true) {
    const { data: missingDistricts, error: missingError } = await supabase
      .from('properties')
      .select('property_name, district')
      .is('district', null)
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (missingError) {
      console.error('Error checking missing districts:', missingError.message)
      return
    }

    if (!missingDistricts.length) break
    allMissingDistricts = [...allMissingDistricts, ...missingDistricts]
    page++
  }

  // Get all stats with pagination
  let allStats: (Pick<PropertyRecord, 'district' | 'property_type'>)[] = []
  page = 0

  while (true) {
    const { data: stats, error: statsError } = await supabase
      .from('properties')
      .select('district, property_type')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (statsError) {
      console.error('Error fetching stats:', statsError.message)
      break
    }

    if (!stats.length) break
    allStats = [...allStats, ...stats]
    page++
  }

  // Report findings
  console.log('=== Missing Districts ===')
  if (allMissingDistricts.length > 0) {
    console.log(`⚠️  Found ${allMissingDistricts.length} properties without districts:`)
    allMissingDistricts.forEach(p => {
      console.log(`- ${p.property_name}`)
    })
  } else {
    console.log('✅ All properties have districts assigned')
  }

  // Check our recent updates with correct districts
  const propertiesToCheck: PropertyToCheck[] = [
    { name: 'Mandarin Gardens', expectedDistrict: 15, location: 'East Coast/Marine Parade' },
    { name: 'The Hillier', expectedDistrict: 23, location: 'Hillview Avenue, Bukit Batok' },
    { name: 'Costa Rhu', expectedDistrict: 15, location: 'Tanjong Rhu' }
  ]

  const { data: recentUpdates, error: updateError } = await supabase
    .from('properties')
    .select('property_name, district, property_type')
    .in('property_name', propertiesToCheck.map(p => p.name))

  console.log('\n=== Property District Verification ===')
  if (recentUpdates && recentUpdates.length > 0) {
    console.log('Checking specific properties:')
    recentUpdates.forEach(property => {
      const expected = propertiesToCheck.find(p => p.name === property.property_name)
      const status = property.district === expected?.expectedDistrict ? '✅' : '❌'
      console.log(`${status} ${property.property_name}:`)
      console.log(`   Current: District ${property.district || 'null'}`)
      console.log(`   Expected: District ${expected?.expectedDistrict} (${expected?.location})`)
      console.log(`   Type: ${property.property_type}`)
      console.log('')
    })
  } else {
    console.log('No properties found to verify')
  }

  // Calculate statistics from all fetched data
  if (allStats.length > 0) {
    const districts = new Set(allStats.map(p => p.district).filter(Boolean))
    const propertyTypes = new Set(allStats.map(p => p.property_type))

    console.log('\n=== Database Statistics ===')
    console.log(`Total properties: ${totalCount}`)
    console.log(`Unique districts: ${districts.size}`)
    console.log('Property types distribution:')
    propertyTypes.forEach(type => {
      const count = allStats.filter(p => p.property_type === type).length
      console.log(`- ${type}: ${count} properties`)
    })
  }
}

// Run verification
console.log('Starting verification process...')
verifyDistricts()
  .then(() => console.log('\nVerification completed'))
  .catch(error => console.error('Verification failed:', error)) 