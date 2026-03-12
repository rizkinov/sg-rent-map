/**
 * Fetch latest URA rental transaction data and update CSV/JSON files.
 *
 * Data source: data.gov.sg – "Renting Out of Flats" and URA private rental contracts.
 *
 * Usage:
 *   npx tsx src/scripts/fetch-ura-2026.ts
 *
 * The script downloads the latest quarterly rental data from data.gov.sg,
 * filters for recent transactions (2025-2026), and outputs CSV files
 * matching the existing format used by the import pipeline.
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'src/data')

// data.gov.sg dataset IDs
const DATASETS = {
  // Private residential rental contracts (URA)
  privateRental: 'd_c9f57187485a850908655db0e8cfe651',
  // HDB median rent by town and flat type
  hdbMedianRent: 'd_23000a00c52996c55106084ed0339566',
}

interface RawRecord {
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

function mapPropertyType(uraType: string): 'Condo' | 'HDB' | 'Landed' {
  const t = uraType.toLowerCase()
  if (t.includes('terrace') || t.includes('detached') || t.includes('bungalow')) return 'Landed'
  if (t.includes('executive condominium') || t.includes('condominium') || t.includes('apartment') || t.includes('non-landed')) return 'Condo'
  return 'HDB'
}

function parseSqftRange(sqft: string): number {
  // "900 to 1,000" → 950
  const parts = sqft.replace(/,/g, '').split(/\s+to\s+/)
  if (parts.length === 2) {
    return Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2)
  }
  return parseInt(parts[0]) || 0
}

function parseRent(rent: string): number {
  return parseInt(rent.replace(/,/g, '')) || 0
}

function isRecent(leaseDate: string): boolean {
  // Keep transactions from 2025 onwards: "Jan-25", "Feb-26", etc.
  const match = leaseDate.match(/(\w+)-(\d{2})/)
  if (!match) return false
  const year = parseInt(match[2])
  return year >= 25  // 2025+
}

async function fetchDataset(datasetId: string): Promise<string> {
  // Step 1: Initiate download
  const initUrl = `https://api-production.data.gov.sg/v2/public/api/datasets/${datasetId}/initiate-download`
  console.log(`Initiating download for dataset ${datasetId}...`)

  const initRes = await fetch(initUrl, { method: 'GET' })
  if (!initRes.ok) {
    throw new Error(`Failed to initiate download: ${initRes.status} ${initRes.statusText}`)
  }

  const initData = await initRes.json()
  const downloadUrl = initData.data?.url

  if (!downloadUrl) {
    // Try poll-download as fallback
    const pollUrl = `https://api-production.data.gov.sg/v2/public/api/datasets/${datasetId}/poll-download`
    const pollRes = await fetch(pollUrl, { method: 'GET' })
    if (!pollRes.ok) {
      throw new Error(`Failed to poll download: ${pollRes.status}`)
    }
    const pollData = await pollRes.json()
    if (!pollData.data?.url) {
      throw new Error('No download URL available. Try again in a few seconds.')
    }
    const csvRes = await fetch(pollData.data.url)
    return csvRes.text()
  }

  const csvRes = await fetch(downloadUrl)
  return csvRes.text()
}

function parseCSV(csvText: string): RawRecord[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const records: RawRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    if (values.length === headers.length) {
      const record: any = {}
      headers.forEach((h, idx) => {
        record[h] = values[idx]
      })
      records.push(record)
    }
  }

  return records
}

function recordToCSVLine(r: RawRecord): string {
  const fields = [
    r['Project Name'],
    r['Street Name'],
    r['Postal District'],
    r['Property Type'],
    r['No of Bedroom'],
    `"${r['Monthly Rent ($)']}"`,
    r['Floor Area (SQM)'],
    r['Floor Area (SQFT)'],
    r['Lease Commencement Date'],
  ]
  return fields.join(',')
}

function toProcessedJSON(r: RawRecord) {
  return {
    property_name: r['Project Name'],
    property_type: mapPropertyType(r['Property Type']),
    district: parseInt(r['Postal District']) || null,
    rental_price: parseRent(r['Monthly Rent ($)']),
    beds: parseInt(r['No of Bedroom']) || null,
    sqft: parseSqftRange(r['Floor Area (SQFT)']),
    street_name: r['Street Name'],
    lease_date: r['Lease Commencement Date'],
  }
}

async function main() {
  console.log('=== URA 2026 Rental Data Fetcher ===\n')

  let csvText: string

  try {
    csvText = await fetchDataset(DATASETS.privateRental)
    console.log(`Downloaded ${csvText.length} bytes of rental data\n`)
  } catch (err) {
    console.error('Failed to download from data.gov.sg:', err)
    console.error('\nIf this fails due to network restrictions, you can:')
    console.error('1. Download manually from: https://data.gov.sg/datasets/d_c9f57187485a850908655db0e8cfe651/view')
    console.error('2. Save the CSV file to: src/data/ura-rental-2026-raw.csv')
    console.error('3. Re-run this script (it will detect the local file)\n')

    // Try local file fallback
    const localPath = path.join(DATA_DIR, 'ura-rental-2026-raw.csv')
    if (fs.existsSync(localPath)) {
      console.log('Found local file, using that instead...')
      csvText = fs.readFileSync(localPath, 'utf-8')
    } else {
      process.exit(1)
    }
  }

  const allRecords = parseCSV(csvText)
  console.log(`Parsed ${allRecords.length} total records`)

  // Filter for 2025-2026 transactions
  const recentRecords = allRecords.filter(r => isRecent(r['Lease Commencement Date']))
  console.log(`Filtered to ${recentRecords.length} records from 2025-2026\n`)

  if (recentRecords.length === 0) {
    console.warn('No recent records found. The dataset may not have 2025+ data yet.')
    console.warn('Keeping all records instead.')
  }

  const records = recentRecords.length > 0 ? recentRecords : allRecords

  // Categorize by property type
  const condos: RawRecord[] = []
  const hdb: RawRecord[] = []
  const landed: RawRecord[] = []

  for (const r of records) {
    const type = mapPropertyType(r['Property Type'])
    if (type === 'Landed') landed.push(r)
    else if (type === 'HDB') hdb.push(r)
    else condos.push(r)
  }

  console.log(`Categorized: ${condos.length} Condo, ${hdb.length} HDB, ${landed.length} Landed\n`)

  // Write CSV files
  const csvHeader = 'Project Name,Street Name,Postal District,Property Type,No of Bedroom,Monthly Rent ($),Floor Area (SQM),Floor Area (SQFT),Lease Commencement Date'

  fs.writeFileSync(
    path.join(DATA_DIR, 'Condo.csv'),
    [csvHeader, ...condos.map(recordToCSVLine)].join('\n')
  )
  console.log(`Wrote Condo.csv (${condos.length} records)`)

  // Split HDB into two files if large
  const hdbMid = Math.ceil(hdb.length / 2)
  fs.writeFileSync(
    path.join(DATA_DIR, 'HDB 1.csv'),
    [csvHeader, ...hdb.slice(0, hdbMid).map(recordToCSVLine)].join('\n')
  )
  fs.writeFileSync(
    path.join(DATA_DIR, 'HDB 2.csv'),
    [csvHeader, ...hdb.slice(hdbMid).map(recordToCSVLine)].join('\n')
  )
  console.log(`Wrote HDB 1.csv (${hdbMid} records) + HDB 2.csv (${hdb.length - hdbMid} records)`)

  fs.writeFileSync(
    path.join(DATA_DIR, 'Landed.csv'),
    [csvHeader, ...landed.map(recordToCSVLine)].join('\n')
  )
  console.log(`Wrote Landed.csv (${landed.length} records)`)

  // Write processed JSON
  const processed = records.map(toProcessedJSON)
  fs.writeFileSync(
    path.join(DATA_DIR, 'processed-properties.json'),
    JSON.stringify(processed, null, 2)
  )
  console.log(`Wrote processed-properties.json (${processed.length} records)`)

  // Print district summary
  console.log('\n=== District Summary ===')
  const byDistrict = new Map<number, typeof processed>()
  for (const p of processed) {
    if (p.district) {
      if (!byDistrict.has(p.district)) byDistrict.set(p.district, [])
      byDistrict.get(p.district)!.push(p)
    }
  }

  const sortedDistricts = [...byDistrict.entries()].sort((a, b) => a[0] - b[0])
  for (const [district, props] of sortedDistricts) {
    const prices = props.map(p => p.rental_price).filter(p => p > 0)
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const condoCount = props.filter(p => p.property_type === 'Condo').length
    const hdbCount = props.filter(p => p.property_type === 'HDB').length
    const landedCount = props.filter(p => p.property_type === 'Landed').length
    console.log(`D${district}: ${props.length} props, avg $${avg}, range $${min}-$${max} (C:${condoCount} H:${hdbCount} L:${landedCount})`)
  }

  console.log('\n=== Next Steps ===')
  console.log('1. Review the generated files in src/data/')
  console.log('2. Run the import script: npx tsx src/scripts/import-properties.ts')
  console.log('3. District stats will auto-update via the Supabase trigger')
}

main().catch(console.error)
