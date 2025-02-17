import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface RawProperty {
  'Project Name': string
  'Street Name': string
  'Postal District': string
  'Property Type': string
  'No of Bedroom': string
  'Monthly Rent ($)': string
  'Floor Area (SQM)': string
  'Floor Area (SQFT)': string
  'Lease Commencement Date': string
}

interface ProcessedProperty {
  property_name: string
  property_type: 'Condo' | 'HDB' | 'Landed'
  district: number
  rental_price: number
  beds: number
  sqft: number
  street_name: string
  lease_date: string
}

// Add a list of known condos
const KNOWN_CONDOS = new Set([
  "D'LEEDON",
  "AVENUE SOUTH RESIDENCE",
  "SKY HABITAT",
  "ORCHARD SCOTTS",
  "AFFINITY AT SERANGOON",
  "THE CASCADIA",
  // ... we can add more
])

function processPropertyData() {
  // Read CSV files
  const condoData = fs.readFileSync(path.join(process.cwd(), 'src/data/Condo.csv'), 'utf-8')
  const hdb1Data = fs.readFileSync(path.join(process.cwd(), 'src/data/HDB 1.csv'), 'utf-8')
  const hdb2Data = fs.readFileSync(path.join(process.cwd(), 'src/data/HDB 2.csv'), 'utf-8')

  // Parse CSV data
  const condoProperties: RawProperty[] = parse(condoData, { columns: true, skip_empty_lines: true })
  const hdb1Properties: RawProperty[] = parse(hdb1Data, { columns: true, skip_empty_lines: true })
  const hdb2Properties: RawProperty[] = parse(hdb2Data, { columns: true, skip_empty_lines: true })

  // Log raw data counts
  console.log('\nRaw Data Counts:')
  console.log('Condo Properties:', condoProperties.length)
  console.log('HDB1 Properties:', hdb1Properties.length)
  console.log('HDB2 Properties:', hdb2Properties.length)

  // Combine HDB data
  const hdbProperties = [...hdb1Properties, ...hdb2Properties]
  console.log('Combined HDB Properties:', hdbProperties.length)

  // Process each property type
  const processedCondos = processProperties(condoProperties, 'Condo')
  const processedHDB = processProperties(hdbProperties, 'HDB')

  // Log processed data counts
  console.log('\nProcessed Data Counts:')
  console.log('Processed Condos:', processedCondos.length)
  console.log('Processed HDB:', processedHDB.length)

  // Sample check
  console.log('\nSample HDB Property:')
  console.log(hdbProperties[0])
  console.log('\nSame property after processing:')
  console.log(processedHDB[0])

  // Combine all properties
  const allProperties = [...processedCondos, ...processedHDB]

  // Save processed data
  fs.writeFileSync(
    path.join(process.cwd(), 'src/data/processed-properties.json'),
    JSON.stringify(allProperties, null, 2)
  )

  console.log('\nFinal Summary:')
  console.log(`Total properties: ${allProperties.length}`)
  console.log(`Condos: ${processedCondos.length}`)
  console.log(`HDB: ${processedHDB.length}`)

  // District distribution
  const districtCounts = allProperties.reduce((acc, prop) => {
    const district = prop.district
    if (!acc[district]) {
      acc[district] = { Condo: 0, HDB: 0, Landed: 0 }
    }
    acc[district][prop.property_type]++
    return acc
  }, {} as Record<number, Record<string, number>>)

  console.log('\nDistrict Distribution:')
  Object.entries(districtCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([district, counts]) => {
      console.log(`\nDistrict ${district}:`)
      console.log(`Condo: ${counts.Condo}`)
      console.log(`HDB: ${counts.HDB}`)
    })
}

// Add a function to determine property type
function determinePropertyType(property: RawProperty, type: 'Condo' | 'HDB' | 'Landed'): 'Condo' | 'HDB' | 'Landed' {
  // If it's from Condo.csv and is Executive Condominium
  if (type === 'Condo' && property['Property Type'] === 'Executive Condominium') {
    return 'Condo'
  }

  // If it's a known condo
  if (KNOWN_CONDOS.has(property['Project Name'])) {
    return 'Condo'
  }

  // If property name contains typical condo indicators
  if (property['Project Name'].match(/CONDO|RESIDENCE|RESIDENCES|PARK|SUITES|GARDENS/i)) {
    return 'Condo'
  }

  // If property name contains typical HDB indicators
  if (property['Project Name'].match(/BLOCK|BLK|STREET|AVENUE|ROAD/i)) {
    return 'HDB'
  }

  // Default to the provided type
  return type
}

function processProperties(properties: RawProperty[], type: 'Condo' | 'HDB' | 'Landed'): ProcessedProperty[] {
  return properties.map(prop => {
    // Extract sqft from range (e.g., "900 to 1,000" -> 950)
    const sqftRange = prop['Floor Area (SQFT)']
      .replace(/,/g, '')
      .split(' to ')
      .map(Number)
    const sqft = Math.round((sqftRange[0] + sqftRange[1]) / 2)

    // Clean rental price
    const rental_price = parseInt(prop['Monthly Rent ($)'].replace(/,/g, ''))

    // Clean bedroom count (handle "03" format)
    const beds = prop['No of Bedroom'] === 'NA' ? 0 : 
      parseInt(prop['No of Bedroom'].replace(/^0+/, ''))

    // Use the new function to determine property type
    const property_type = determinePropertyType(prop, type)

    return {
      property_name: prop['Project Name'].trim(),
      property_type,
      district: parseInt(prop['Postal District']),
      rental_price,
      beds,
      sqft,
      street_name: prop['Street Name'].trim(),
      lease_date: prop['Lease Commencement Date']
    }
  })
}

processPropertyData() 