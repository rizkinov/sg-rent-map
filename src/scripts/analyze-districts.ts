import { createClient } from '@supabase/supabase-js'
import { config } from './config'

async function analyzeDistricts() {
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  )

  console.log('Analyzing district distribution...')

  // Get counts by district and property type
  const { data, error } = await supabase
    .from('properties')
    .select('district, property_type')

  if (error) {
    console.error('Error fetching data:', error)
    return
  }

  // Create district summary
  const districtSummary = data.reduce((acc: Record<string, any>, property) => {
    const district = property.district || 'Unknown'
    if (!acc[district]) {
      acc[district] = {
        total: 0,
        Condo: 0,
        HDB: 0,
        Landed: 0
      }
    }
    acc[district].total++
    acc[district][property.property_type]++
    return acc
  }, {})

  // Print summary
  console.log('\nDistrict Distribution:')
  Object.entries(districtSummary)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([district, counts]) => {
      console.log(`\nDistrict ${district}:`)
      console.log(`Total: ${counts.total}`)
      console.log(`- Condo: ${counts.Condo}`)
      console.log(`- HDB: ${counts.HDB}`)
      console.log(`- Landed: ${counts.Landed}`)
    })
}

analyzeDistricts().catch(console.error) 