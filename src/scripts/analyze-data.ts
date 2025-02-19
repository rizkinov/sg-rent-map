import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import type { Database } from '@/types/database'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function analyzeData() {
  console.log('Starting data analysis...\n')

  // 1. Property Types Distribution
  const { data: properties, error: fetchError } = await supabase
    .from('properties')
    .select('*')

  if (fetchError) {
    console.error('Error fetching properties:', fetchError)
    return
  }

  // Calculate distributions and statistics from the fetched data
  const typeDistribution = properties.reduce((acc: Record<string, number>, prop) => {
    acc[prop.property_type] = (acc[prop.property_type] || 0) + 1
    return acc
  }, {})

  console.log('Property Types Distribution:')
  Object.entries(typeDistribution)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`${type}: ${count} properties`)
    })

  // 2. District Distribution
  const districtDistribution = properties.reduce((acc: Record<string, number>, prop) => {
    const district = prop.district || 'Unknown'
    acc[district] = (acc[district] || 0) + 1
    return acc
  }, {})

  console.log('\nDistrict Distribution:')
  Object.entries(districtDistribution)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([district, count]) => {
      console.log(`District ${district}: ${count} properties`)
    })

  // 3. Price Statistics
  const priceStats = properties.reduce((stats, prop) => ({
    min: Math.min(stats.min, prop.rental_price),
    max: Math.max(stats.max, prop.rental_price),
    sum: stats.sum + prop.rental_price,
    count: stats.count + 1
  }), { min: Infinity, max: -Infinity, sum: 0, count: 0 })

  console.log('\nRental Price Statistics:')
  console.log(`Min: $${priceStats.min}`)
  console.log(`Max: $${priceStats.max}`)
  console.log(`Average: $${Math.round(priceStats.sum / priceStats.count)}`)

  // 4. Bedroom Distribution
  const bedroomDistribution = properties.reduce((acc: Record<number, number>, prop) => {
    acc[prop.beds] = (acc[prop.beds] || 0) + 1
    return acc
  }, {})

  console.log('\nBedroom Distribution:')
  Object.entries(bedroomDistribution)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([beds, count]) => {
      console.log(`${beds} bedrooms: ${count} properties`)
    })

  // 5. Size Statistics
  const sizeStats = properties.reduce((stats, prop) => ({
    min: Math.min(stats.min, prop.sqft),
    max: Math.max(stats.max, prop.sqft),
    sum: stats.sum + prop.sqft,
    count: stats.count + 1
  }), { min: Infinity, max: -Infinity, sum: 0, count: 0 })

  console.log('\nSize Statistics:')
  console.log(`Min: ${sizeStats.min} sqft`)
  console.log(`Max: ${sizeStats.max} sqft`)
  console.log(`Average: ${Math.round(sizeStats.sum / sizeStats.count)} sqft`)

  // 6. Top 10 Most Expensive Districts
  const districtAverages = properties.reduce((acc: Record<string, { sum: number; count: number }>, prop) => {
    if (prop.district) {
      if (!acc[prop.district]) {
        acc[prop.district] = { sum: 0, count: 0 }
      }
      acc[prop.district].sum += prop.rental_price
      acc[prop.district].count++
    }
    return acc
  }, {})

  const expensiveDistricts = Object.entries(districtAverages)
    .map(([district, stats]) => ({
      district: Number(district),
      avg: Math.round(stats.sum / stats.count)
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)

  console.log('\nTop 10 Most Expensive Districts:')
  expensiveDistricts.forEach((district) => {
    console.log(`District ${district.district}: $${district.avg} average`)
  })
}

console.log('Running data analysis...')
analyzeData()
  .then(() => console.log('\nAnalysis completed!'))
  .catch(error => {
    console.error('Analysis failed:', error)
    process.exit(1)
  }) 