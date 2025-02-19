import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { parse } from 'csv-parse/sync'

interface CSVRecord {
  id?: string
  property_name: string
  district: string
  property_type: string
  rental_price: string
  beds: string
  baths: string
  sqft: string
  [key: string]: string | undefined  // For any other fields
}

async function fixPropertyData() {
  console.log('Starting data fix process...')

  // Read all data sources
  const csvPath = path.join(process.cwd(), 'src/data/properties_rows_corrected.csv')
  const backupPath = path.join(process.cwd(), 'src/data/properties_rows_corrected.csv')

  // Read and parse CSV properly
  const csvContent = fs.readFileSync(csvPath)
  const csvRecords = parse(csvContent, { 
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CSVRecord[]

  console.log('\nAnalyzing input data...')
  console.log(`Total CSV records: ${csvRecords.length}`)
  
  const existingIds = csvRecords.filter(r => r.id && r.id.trim() !== '').length
  const missingIds = csvRecords.filter(r => !r.id || r.id.trim() === '').length
  
  console.log(`Records with existing IDs: ${existingIds}`)
  console.log(`Records missing IDs: ${missingIds}`)

  // Create a map of existing properties by name and details
  const propertyMap = new Map()
  let preservedIdCount = 0
  let matchedIdCount = 0
  let generatedIdCount = 0
  
  // Create a map to track duplicates
  const duplicateTracker = new Map<string, number>()
  
  // First, add records with valid IDs
  csvRecords.forEach(record => {
    if (record.id && record.id.trim() !== '') {
      propertyMap.set(record.id, {
        ...record,
        id_source: 'preserved'
      })
      preservedIdCount++
    }
  })

  // Then, handle records without IDs
  csvRecords.forEach(record => {
    if (!record.id || record.id.trim() === '') {
      const key = `${record.property_name}-${record.district}-${record.rental_price}`
      
      // Try to find existing record with same details
      const existingRecord = Array.from(propertyMap.values()).find(r => 
        r.property_name === record.property_name &&
        r.district === record.district &&
        r.rental_price === record.rental_price &&
        r.id_source === 'preserved' // Only match with preserved records
      )

      if (existingRecord) {
        record.id = existingRecord.id
        record.id_source = 'matched'
        matchedIdCount++
      } else {
        // For new records, check if we've seen this combination before
        const dupCount = duplicateTracker.get(key) || 0
        duplicateTracker.set(key, dupCount + 1)
        
        record.id = uuidv4()
        record.id_source = 'generated'
        record.duplicate_number = dupCount > 0 ? dupCount.toString() : undefined
        generatedIdCount++
      }

      propertyMap.set(record.id, record)
    }
  })

  // Write fixed data back to CSV with headers
  const headers = [
    'id',
    'property_name',
    'property_type',
    'district',
    'rental_price',
    'beds',
    'baths',
    'sqft',
    'mrt',
    'latitude',
    'longitude',
    'completion_year',
    'url',
    'created_at',
    'updated_at',
    'street_name',
    'lease_date'
  ]

  const fixedCsvContent = [
    headers.join(','),
    ...Array.from(propertyMap.values())
      .map(record => headers.map(header => record[header] || '').join(','))
  ].join('\n')

  const outputPath = path.join(process.cwd(), 'src/data/properties_fixed.csv')
  fs.writeFileSync(outputPath, fixedCsvContent)

  console.log('\nID Resolution Summary:')
  console.log(`Preserved original IDs: ${preservedIdCount}`)
  console.log(`Matched to existing records: ${matchedIdCount}`)
  console.log(`Generated new IDs: ${generatedIdCount}`)
  console.log(`Total records processed: ${propertyMap.size}`)
  console.log(`Expected total: ${csvRecords.length}`)
  
  if (propertyMap.size !== csvRecords.length) {
    console.warn('\n⚠️ Warning: Some records may have been lost during processing')
    console.warn(`Missing ${csvRecords.length - propertyMap.size} records`)
  }

  // Sample validation with more details
  console.log('\nValidation Sample:')
  const sampleSize = 5
  const sample = Array.from(propertyMap.values()).slice(0, sampleSize)
  sample.forEach(record => {
    console.log(`- ${record.property_name} (District ${record.district}):`)
    console.log(`  ID: ${record.id}`)
    console.log(`  Source: ${record.id_source}`)
    console.log(`  Price: $${record.rental_price}`)
    if (record.duplicate_number) console.log(`  Duplicate #: ${record.duplicate_number}`)
    console.log('')
  })

  console.log(`\nOutput saved to: ${outputPath}`)
}

// Run the fix
console.log('Starting data fix...')
fixPropertyData()
  .then(() => console.log('Data fix completed successfully'))
  .catch(error => {
    console.error('Data fix failed:', error)
    process.exit(1)
  }) 