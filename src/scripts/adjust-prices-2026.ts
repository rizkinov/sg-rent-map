/**
 * Adjust existing property data files to Q1 2026 market levels.
 *
 * Applies the same region-based % adjustments as the SQL migration
 * (014_update_rents_2026.sql) to the local data files:
 *   - processed-properties.json
 *   - properties_fixed.csv
 *
 * This ensures the local files, Supabase DB, and frontend static data
 * all reflect consistent Q1 2026 pricing.
 *
 * Usage:
 *   npx tsx src/scripts/adjust-prices-2026.ts
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'src/data')

// Region-based adjustment factors (from Dec-24 → Jan-26)
// Based on URA, 99.co, ERA, Savills Q1 2026 data
const ADJUSTMENTS: Record<number, number> = {
  // CCR: +4.5%
  1: 1.045, 2: 1.045, 4: 1.045, 6: 1.045, 9: 1.045, 10: 1.045, 11: 1.045,
  // RCR: +3.0%
  3: 1.030, 5: 1.030, 7: 1.030, 8: 1.030, 12: 1.030, 13: 1.030, 14: 1.030, 15: 1.030,
  // OCR: +2.5%
  16: 1.025, 17: 1.025, 18: 1.025, 19: 1.025, 20: 1.025,
  22: 1.025, 23: 1.025, 24: 1.025, 25: 1.025, 27: 1.025, 28: 1.025,
  // Exceptions
  21: 1.055,  // Clementi: stronger gains (6-13% observed)
  26: 1.000,  // Upper Thomson: flat (declines in some segments)
}

function getAdjustment(district: number | null): number {
  if (!district) return 1.025 // default OCR-level for unknown districts
  return ADJUSTMENTS[district] ?? 1.025
}

function adjustProcessedJSON() {
  const filePath = path.join(DATA_DIR, 'processed-properties.json')
  if (!fs.existsSync(filePath)) {
    console.log('processed-properties.json not found, skipping')
    return
  }

  console.log('Adjusting processed-properties.json...')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  let adjusted = 0
  let skipped = 0

  for (const record of data) {
    if (record.lease_date === 'Dec-24' && record.rental_price) {
      const factor = getAdjustment(record.district)
      record.rental_price = Math.round(record.rental_price * factor)
      record.lease_date = 'Jan-26'
      adjusted++
    } else {
      skipped++
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  console.log(`  Adjusted: ${adjusted} records, Skipped: ${skipped} records`)

  // Print per-district summary
  const byDistrict = new Map<number, number[]>()
  for (const r of data) {
    if (r.district && r.rental_price) {
      if (!byDistrict.has(r.district)) byDistrict.set(r.district, [])
      byDistrict.get(r.district)!.push(r.rental_price)
    }
  }

  console.log('\n  District summary after adjustment:')
  for (const [d, prices] of [...byDistrict.entries()].sort((a, b) => a[0] - b[0])) {
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
    console.log(`    D${d}: ${prices.length} props, avg $${avg}, range $${Math.min(...prices)}-$${Math.max(...prices)}`)
  }
}

function adjustCSV(filename: string) {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) {
    console.log(`${filename} not found, skipping`)
    return
  }

  console.log(`\nAdjusting ${filename}...`)
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')

  if (lines.length < 2) {
    console.log('  Empty file, skipping')
    return
  }

  const header = lines[0]
  // Parse header to find column indices
  const cols = header.split(',').map(c => c.trim())
  const districtIdx = cols.indexOf('Postal District')
  const rentIdx = cols.indexOf('Monthly Rent ($)')
  const leaseIdx = cols.indexOf('Lease Commencement Date')

  if (districtIdx === -1 || rentIdx === -1 || leaseIdx === -1) {
    console.log(`  Could not find required columns in ${filename}`)
    return
  }

  let adjusted = 0
  const newLines = [header]

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Parse CSV respecting quoted fields
    const fields: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    fields.push(current.trim())

    if (fields.length !== cols.length) {
      newLines.push(line) // keep malformed lines as-is
      continue
    }

    const leaseDate = fields[leaseIdx]
    if (leaseDate === 'Dec-24') {
      const district = parseInt(fields[districtIdx]) || null
      const rent = parseInt(fields[rentIdx].replace(/,/g, '')) || 0

      if (rent > 0) {
        const factor = getAdjustment(district)
        const newRent = Math.round(rent * factor)
        fields[rentIdx] = newRent.toLocaleString('en-US')
        fields[leaseIdx] = 'Jan-26'
        adjusted++
      }
    }

    // Rebuild line, quoting rent field if it contains commas
    const rebuiltFields = fields.map((f, idx) => {
      if (idx === rentIdx && f.includes(',')) return `"${f}"`
      return f
    })
    newLines.push(rebuiltFields.join(','))
  }

  fs.writeFileSync(filePath, newLines.join('\n'))
  console.log(`  Adjusted: ${adjusted} records`)
}

function main() {
  console.log('=== Price Adjustment to Q1 2026 ===\n')
  console.log('Adjustment factors by region:')
  console.log('  CCR (D1,2,4,6,9,10,11): +4.5%')
  console.log('  RCR (D3,5,7,8,12-15): +3.0%')
  console.log('  OCR (D16-28): +2.5%')
  console.log('  D21 (Clementi): +5.5%')
  console.log('  D26 (Upper Thomson): +0%\n')

  adjustProcessedJSON()
  adjustCSV('Condo.csv')
  adjustCSV('HDB 1.csv')
  adjustCSV('HDB 2.csv')
  adjustCSV('Landed.csv')

  console.log('\n=== Done ===')
  console.log('\nNext steps:')
  console.log('1. Review the adjusted data')
  console.log('2. Run: npx tsx src/scripts/import-properties.ts  (to push to Supabase)')
  console.log('3. Or run the SQL migration: 014_update_rents_2026.sql  (if DB already has data)')
}

main()
