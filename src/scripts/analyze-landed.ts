import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface RawLandedProperty {
  'Project Name': string
  'Property Type': string
  'Monthly Rent ($)': string
  'Floor Area (SQFT)': string
}

function estimateBedrooms(property: RawLandedProperty): number {
  const sqftRange = property['Floor Area (SQFT)']
    .replace(/,/g, '')
    .split(' to ')
    .map(Number)
  const minSqft = sqftRange[0]
  const price = parseInt(property['Monthly Rent ($)'].replace(/,/g, ''))
  
  // Get property type
  const type = property['Property Type']

  // Refined estimation rules
  if (type === 'Detached House') {
    if (minSqft >= 10000) return 8
    if (minSqft >= 8000) return 7
    if (minSqft >= 6000) return 6
    if (minSqft >= 4000) return 5
    if (minSqft >= 3000) return 4
    return 3
  }

  if (type === 'Semi-Detached House') {
    if (minSqft >= 5000) return 6
    if (minSqft >= 4000) return 5
    if (minSqft >= 3000) return 4
    if (minSqft >= 2000) return 3
    return 2
  }

  // Terrace House with price consideration
  if (price >= 15000) return 5  // Luxury terrace houses
  if (minSqft >= 4000) return 5
  if (minSqft >= 3000) return 4
  if (minSqft >= 2000) return 3
  return 2
}

function analyzeLandedProperties() {
  // Read CSV file
  const landedData = fs.readFileSync(path.join(process.cwd(), 'src/data/Landed.csv'), 'utf-8')
  const properties: RawLandedProperty[] = parse(landedData, { columns: true })

  // Analyze distribution
  const analysis = {
    byType: {} as Record<string, number>,
    byBedrooms: {} as Record<number, number>,
    bySqft: [] as number[],
    byPrice: [] as number[]
  }

  const estimatedProperties = properties.map(prop => {
    const beds = estimateBedrooms(prop)
    const type = prop['Property Type']
    const price = parseInt(prop['Monthly Rent ($)'].replace(/,/g, ''))
    const sqft = parseInt(prop['Floor Area (SQFT)'].split(' to ')[0].replace(/,/g, ''))

    analysis.byType[type] = (analysis.byType[type] || 0) + 1
    analysis.byBedrooms[beds] = (analysis.byBedrooms[beds] || 0) + 1
    analysis.bySqft.push(sqft)
    analysis.byPrice.push(price)

    return {
      ...prop,
      estimated_bedrooms: beds
    }
  })

  // Print analysis
  console.log('\n=== Property Type Distribution ===')
  Object.entries(analysis.byType).forEach(([type, count]) => {
    console.log(`${type}: ${count}`)
  })

  console.log('\n=== Estimated Bedrooms Distribution ===')
  Object.entries(analysis.byBedrooms)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([beds, count]) => {
      console.log(`${beds} bedrooms: ${count}`)
    })

  console.log('\n=== Size Analysis ===')
  const avgSqft = analysis.bySqft.reduce((a, b) => a + b) / analysis.bySqft.length
  console.log(`Average size: ${Math.round(avgSqft)} sqft`)

  console.log('\n=== Price Analysis ===')
  const avgPrice = analysis.byPrice.reduce((a, b) => a + b) / analysis.byPrice.length
  console.log(`Average rent: $${Math.round(avgPrice)}`)

  // Save estimated data
  const outputPath = path.join(process.cwd(), 'src/data/landed-with-bedrooms.json')
  fs.writeFileSync(outputPath, JSON.stringify(estimatedProperties, null, 2))
  console.log(`\nSaved estimated data to ${outputPath}`)
}

analyzeLandedProperties() 