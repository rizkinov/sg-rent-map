import fs from 'fs'
import path from 'path'
import type { PropertyRecord } from '@/types/supabase'
import type { PropertyType } from '@/types/property'

interface RawProperty extends Omit<PropertyRecord, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

interface ValidationError {
  property: Partial<RawProperty>
  error: string
}

function validatePropertyType(type: string): type is PropertyType {
  return ['Condo', 'HDB', 'Landed'].includes(type)
}

function validateNumericField(value: any, fieldName: string): number {
  const num = Number(value)
  if (isNaN(num)) {
    throw new Error(`Invalid ${fieldName}: ${value}`)
  }
  return num
}

async function cleanDistrictsData() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'src/data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Read the file
    const filePath = path.join(process.cwd(), 'src/data/properties-missing-districts-fixed.json')
    if (!fs.existsSync(filePath)) {
      throw new Error(`Input file not found: ${filePath}`)
    }

    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    // Parse and validate the data
    const properties = JSON.parse(fileContent) as RawProperty[]
    const validationErrors: ValidationError[] = []
    const cleanedProperties: RawProperty[] = []

    console.log(`Processing ${properties.length} properties...`)

    for (const property of properties) {
      try {
        // Required fields validation
        if (!property.property_name) {
          throw new Error('Missing property name')
        }
        if (!property.property_type) {
          throw new Error('Missing property type')
        }
        if (!validatePropertyType(property.property_type)) {
          throw new Error(`Invalid property type: ${property.property_type}`)
        }

        // Clean and validate numeric fields
        const cleanedProperty: RawProperty = {
          ...property,
          rental_price: validateNumericField(property.rental_price, 'rental price'),
          beds: validateNumericField(property.beds, 'beds'),
          baths: validateNumericField(property.baths, 'baths'),
          sqft: validateNumericField(property.sqft, 'sqft'),
          latitude: validateNumericField(property.latitude, 'latitude'),
          longitude: validateNumericField(property.longitude, 'longitude')
        }

        // Validate coordinate ranges for Singapore
        if (cleanedProperty.latitude < 1.2 || cleanedProperty.latitude > 1.5) {
          throw new Error(`Invalid latitude: ${cleanedProperty.latitude}`)
        }
        if (cleanedProperty.longitude < 103.6 || cleanedProperty.longitude > 104.1) {
          throw new Error(`Invalid longitude: ${cleanedProperty.longitude}`)
        }

        // Validate reasonable ranges
        if (cleanedProperty.rental_price < 500 || cleanedProperty.rental_price > 50000) {
          throw new Error(`Suspicious rental price: ${cleanedProperty.rental_price}`)
        }
        if (cleanedProperty.sqft < 200 || cleanedProperty.sqft > 10000) {
          throw new Error(`Suspicious sqft: ${cleanedProperty.sqft}`)
        }
        if (cleanedProperty.beds < 0 || cleanedProperty.beds > 10) {
          throw new Error(`Suspicious number of beds: ${cleanedProperty.beds}`)
        }

        cleanedProperties.push(cleanedProperty)
      } catch (error) {
        validationErrors.push({
          property,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Write the cleaned data
    const outputPath = path.join(process.cwd(), 'src/data/properties-cleaned.json')
    fs.writeFileSync(outputPath, JSON.stringify(cleanedProperties, null, 2))

    // Write validation errors if any
    if (validationErrors.length > 0) {
      const errorPath = path.join(process.cwd(), 'src/data/validation-errors.json')
      fs.writeFileSync(errorPath, JSON.stringify(validationErrors, null, 2))
      console.log(`\n⚠️  Found ${validationErrors.length} validation errors. See ${errorPath}`)
    }

    // Print summary
    console.log('\n=== Cleaning Summary ===')
    console.log(`Total properties processed: ${properties.length}`)
    console.log(`Successfully cleaned: ${cleanedProperties.length}`)
    console.log(`Validation errors: ${validationErrors.length}`)
    console.log(`\nCleaned data saved to: ${outputPath}`)

  } catch (error) {
    console.error('Error cleaning data:', error)
    process.exit(1)
  }
}

// Run the cleaning process
console.log('Starting data cleaning process...')
cleanDistrictsData()
  .then(() => console.log('\nData cleaning completed'))
  .catch(error => console.error('Data cleaning failed:', error)) 