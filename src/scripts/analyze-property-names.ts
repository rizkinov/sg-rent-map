import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface RawProperty {
  'Project Name': string
  'Property Type': string
  'Street Name': string
  'Monthly Rent ($)': string
}

function analyzePropertyNames() {
  // Read all CSV files
  const condoData = fs.readFileSync(path.join(process.cwd(), 'src/data/Condo.csv'), 'utf-8')
  const hdb1Data = fs.readFileSync(path.join(process.cwd(), 'src/data/HDB 1.csv'), 'utf-8')
  const hdb2Data = fs.readFileSync(path.join(process.cwd(), 'src/data/HDB 2.csv'), 'utf-8')

  // Parse CSV data
  const condoProperties: RawProperty[] = parse(condoData, { columns: true })
  const hdb1Properties: RawProperty[] = parse(hdb1Data, { columns: true })
  const hdb2Properties: RawProperty[] = parse(hdb2Data, { columns: true })

  // Create a set of known condos from Condo.csv
  const knownCondos = new Set(condoProperties.map(p => p['Project Name']))

  // Get average prices for each property
  const pricesByProperty = new Map<string, number[]>()
  const allProperties = [...condoProperties, ...hdb1Properties, ...hdb2Properties]
  
  allProperties.forEach(p => {
    const price = parseInt(p['Monthly Rent ($)'].replace(/,/g, ''))
    const name = p['Project Name']
    if (!pricesByProperty.has(name)) {
      pricesByProperty.set(name, [price])
    } else {
      pricesByProperty.get(name)?.push(price)
    }
  })

  // Calculate averages
  const avgPrices = new Map<string, number>()
  pricesByProperty.forEach((prices, name) => {
    avgPrices.set(name, prices.reduce((a, b) => a + b) / prices.length)
  })

  // Refined categorization rules
  const condoIndicators = [
    // Names
    'RESIDENCES', 'RESIDENCE', 'CONDO', 'CONDOMINIUM', 
    'SUITES', 'PARK', 'GARDENS', 'TOWER', 'TOWERS',
    'COURT', 'COURTS', 'VIEW', 'HILLS', 'VILLA', 'VILLAS',
    // Locations
    'AMBER', 'NASSIM', 'ORCHARD', 'MEYER', 'NEWTON',
    // Common prefixes
    'THE ', 'LE ', 'LA ',
    // Common suffixes
    ' EDGE', ' GREEN', ' POINT', ' VISTA'
  ]

  const hdbIndicators = [
    // Physical indicators
    'BLOCK', 'BLK', 'FLAT', 'FLATS',
    // Government terms
    'HDB', 'HOUSING',
    // HDB towns
    'JURONG', 'WOODLANDS', 'TAMPINES', 'BEDOK', 'TOA PAYOH',
    'ANG MO KIO', 'HOUGANG', 'SENGKANG', 'PUNGGOL'
  ]

  // Price thresholds
  const LIKELY_CONDO_PRICE = 3500
  const LIKELY_HDB_PRICE = 2800

  // Categorize properties
  const likelyCondo: string[] = []
  const likelyHDB: string[] = []
  const needsReview: string[] = []

  const uniqueNames = new Set(allProperties.map(p => p['Project Name']))

  uniqueNames.forEach(name => {
    if (knownCondos.has(name)) {
      likelyCondo.push(name)
      return
    }

    const upperName = name.toUpperCase()
    const avgPrice = avgPrices.get(name) || 0

    if (condoIndicators.some(i => upperName.includes(i)) || avgPrice > LIKELY_CONDO_PRICE) {
      likelyCondo.push(name)
    } else if (hdbIndicators.some(i => upperName.includes(i)) || avgPrice < LIKELY_HDB_PRICE) {
      likelyHDB.push(name)
    } else {
      needsReview.push(name)
    }
  })

  // Print analysis
  console.log('\n=== Property Type Distribution ===')
  console.log(`Known Condos from Condo.csv: ${knownCondos.size}`)
  console.log(`Likely Condos: ${likelyCondo.length}`)
  console.log(`Likely HDB: ${likelyHDB.length}`)
  console.log(`Needs Review: ${needsReview.length}`)

  // Save results to files
  fs.writeFileSync(
    path.join(process.cwd(), 'src/data/likely-condos.txt'),
    likelyCondo.sort().join('\n')
  )
  fs.writeFileSync(
    path.join(process.cwd(), 'src/data/likely-hdb.txt'),
    likelyHDB.sort().join('\n')
  )
  fs.writeFileSync(
    path.join(process.cwd(), 'src/data/needs-review.txt'),
    needsReview.sort().join('\n')
  )
}

analyzePropertyNames() 