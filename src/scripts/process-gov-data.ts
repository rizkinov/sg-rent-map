import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import type { PropertyType } from '@/types/property'
import type { PropertyRecord } from '@/types/supabase'

interface RawGovProperty {
  'Project Name': string
  'Street Name': string
  'Postal District': string
  'Property Type': string
  'Monthly Rent ($)': string
  'Floor Area (SQFT)': string
  'Lease Commencement Date': string
  'No. of Bedrooms': string
}

interface ProcessedProperty extends Omit<PropertyRecord, 'id' | 'created_at' | 'updated_at'> {
  source: 'gov_data'
}

function validatePropertyType(type: string): PropertyType {
  const typeMap: Record<string, PropertyType> = {
    'Condominium': 'Condo',
    'Apartment': 'Condo',
    'HDB': 'HDB',
    'Terrace House': 'Landed',
    'Semi-Detached House': 'Landed',
    'Detached House': 'Landed'
  }

  const mappedType = typeMap[type]
  if (!mappedType) {
    throw new Error(`Unknown property type: ${type}`)
  }
  return mappedType
}

function validateDistrict(district: string): number {
  const num = parseInt(district)
  if (isNaN(num) || num < 1 || num > 28) {
    throw new Error(`Invalid district number: ${district}`)
  }
  return num
}

async function processPropertyData() {
  try {
    // Read CSV file
    const filePath = path.join(process.cwd(), 'data/raw/rental_transactions.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as RawGovProperty[]

    console.log(`Processing ${records.length} records...`)

    const processedProperties: ProcessedProperty[] = []
    const errors: { record: RawGovProperty; error: string }[] = []

    for (const record of records) {
      try {
        // Clean and validate data
        const rental_price = parseInt(record['Monthly Rent ($)'].replace(/[^0-9]/g, ''))
        if (isNaN(rental_price) || rental_price <= 0) {
          throw new Error(`Invalid rental price: ${record['Monthly Rent ($)']}`)
        }

        const sqft = parseInt(record['Floor Area (SQFT)'].replace(/[^0-9]/g, ''))
        if (isNaN(sqft) || sqft <= 0) {
          throw new Error(`Invalid floor area: ${record['Floor Area (SQFT)']}`)
        }

        const beds = parseInt(record['No. of Bedrooms'])
        if (isNaN(beds) || beds < 0) {
          throw new Error(`Invalid number of bedrooms: ${record['No. of Bedrooms']}`)
        }

        const property: ProcessedProperty = {
          property_name: record['Project Name'].trim(),
          property_type: validatePropertyType(record['Property Type']),
          district: validateDistrict(record['Postal District']),
          rental_price,
          beds,
          baths: Math.min(beds + 1, 4), // Estimate bathrooms based on bedrooms
          sqft,
          latitude: 0, // Will be populated later
          longitude: 0, // Will be populated later
          street_name: record['Street Name'].trim(),
          lease_date: record['Lease Commencement Date'],
          source: 'gov_data'
        }

        processedProperties.push(property)
      } catch (error) {
        errors.push({
          record,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Write processed data
    const outputPath = path.join(process.cwd(), 'src/data/processed-properties.json')
    fs.writeFileSync(outputPath, JSON.stringify(processedProperties, null, 2))

    // Write errors if any
    if (errors.length > 0) {
      const errorPath = path.join(process.cwd(), 'src/data/processing-errors.json')
      fs.writeFileSync(errorPath, JSON.stringify(errors, null, 2))
    }

    // Print summary
    console.log('\n=== Processing Summary ===')
    console.log(`Total records: ${records.length}`)
    console.log(`Successfully processed: ${processedProperties.length}`)
    console.log(`Errors: ${errors.length}`)
    console.log(`\nProcessed data saved to: ${outputPath}`)
    if (errors.length > 0) {
      console.log(`Errors saved to: ${path.join(process.cwd(), 'src/data/processing-errors.json')}`)
    }

  } catch (error) {
    console.error('Error processing data:', error)
    process.exit(1)
  }
}

console.log('Starting data processing...')
processPropertyData()
  .then(() => console.log('\nProcessing completed'))
  .catch(error => console.error('Processing failed:', error)) 