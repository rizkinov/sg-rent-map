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

function checkRawData() {
  // Read CSV files
  const condoData = fs.readFileSync(path.join(process.cwd(), 'src/data/Condo.csv'), 'utf-8')
  const hdb1Data = fs.readFileSync(path.join(process.cwd(), 'src/data/HDB 1.csv'), 'utf-8')
  const hdb2Data = fs.readFileSync(path.join(process.cwd(), 'src/data/HDB 2.csv'), 'utf-8')

  // Parse CSV data
  const condoProperties: RawProperty[] = parse(condoData, { columns: true, skip_empty_lines: true })
  const hdb1Properties: RawProperty[] = parse(hdb1Data, { columns: true, skip_empty_lines: true })
  const hdb2Properties: RawProperty[] = parse(hdb2Data, { columns: true, skip_empty_lines: true })

  // Analyze districts in each file
  console.log('\nCondo Districts:', new Set(condoProperties.map((p: RawProperty) => p['Postal District'])))
  console.log('\nHDB1 Districts:', new Set(hdb1Properties.map((p: RawProperty) => p['Postal District'])))
  console.log('\nHDB2 Districts:', new Set(hdb2Properties.map((p: RawProperty) => p['Postal District'])))

  // Check property types
  console.log('\nCondo Property Types:', new Set(condoProperties.map((p: RawProperty) => p['Property Type'])))
  console.log('\nHDB1 Property Types:', new Set(hdb1Properties.map((p: RawProperty) => p['Property Type'])))
  console.log('\nHDB2 Property Types:', new Set(hdb2Properties.map((p: RawProperty) => p['Property Type'])))

  // Count records
  console.log('\nCounts:')
  console.log('Condo:', condoProperties.length)
  console.log('HDB1:', hdb1Properties.length)
  console.log('HDB2:', hdb2Properties.length)
}

checkRawData() 