/**
 * Adjust existing property data files to Q1 2026 market levels.
 *
 * This script does TWO things:
 *   1. Applies region-based % price adjustments (Dec-24 → Jan-26)
 *   2. Fills in missing data: baths, geocoding (via OneMap), nearest MRT
 *
 * Files updated:
 *   - properties_fixed.csv (main Supabase import file)
 *   - processed-properties.json
 *   - Condo.csv, HDB 1.csv, HDB 2.csv, Landed.csv
 *
 * Usage:
 *   npx tsx src/scripts/adjust-prices-2026.ts           # prices only (fast)
 *   npx tsx src/scripts/adjust-prices-2026.ts --geocode  # prices + geocode missing coords
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'src/data')
const DO_GEOCODE = process.argv.includes('--geocode')
const GEOCODE_DELAY_MS = 100

// ─── Region-based adjustment factors (Dec-24 → Jan-26) ──────────────────────
const ADJUSTMENTS: Record<number, number> = {
  // CCR: +4.5%
  1: 1.045, 2: 1.045, 4: 1.045, 6: 1.045, 9: 1.045, 10: 1.045, 11: 1.045,
  // RCR: +3.0%
  3: 1.030, 5: 1.030, 7: 1.030, 8: 1.030, 12: 1.030, 13: 1.030, 14: 1.030, 15: 1.030,
  // OCR: +2.5%
  16: 1.025, 17: 1.025, 18: 1.025, 19: 1.025, 20: 1.025,
  22: 1.025, 23: 1.025, 24: 1.025, 25: 1.025, 27: 1.025, 28: 1.025,
  // Exceptions
  21: 1.055,  // Clementi: stronger gains
  26: 1.000,  // Upper Thomson: flat
}

function getAdjustment(district: number | null): number {
  if (!district) return 1.025
  return ADJUSTMENTS[district] ?? 1.025
}

// ─── MRT Stations ────────────────────────────────────────────────────────────
const MRT_STATIONS: Record<string, [number, number]> = {
  'Jurong East': [1.3329, 103.7422], 'Bukit Batok': [1.3490, 103.7496],
  'Bukit Gombak': [1.3587, 103.7519], 'Choa Chu Kang': [1.3853, 103.7445],
  'Yew Tee': [1.3973, 103.7474], 'Kranji': [1.4251, 103.7620],
  'Marsiling': [1.4326, 103.7740], 'Woodlands': [1.4370, 103.7865],
  'Admiralty': [1.4406, 103.8009], 'Sembawang': [1.4491, 103.8201],
  'Canberra': [1.4431, 103.8296], 'Yishun': [1.4293, 103.8353],
  'Khatib': [1.4174, 103.8329], 'Yio Chu Kang': [1.3817, 103.8449],
  'Ang Mo Kio': [1.3700, 103.8496], 'Bishan': [1.3513, 103.8492],
  'Braddell': [1.3404, 103.8468], 'Toa Payoh': [1.3327, 103.8473],
  'Novena': [1.3204, 103.8438], 'Newton': [1.3138, 103.8378],
  'Orchard': [1.3045, 103.8318], 'Somerset': [1.3006, 103.8387],
  'Dhoby Ghaut': [1.2994, 103.8456], 'City Hall': [1.2931, 103.8519],
  'Raffles Place': [1.2836, 103.8514], 'Marina Bay': [1.2764, 103.8546],
  'Marina South Pier': [1.2714, 103.8634],
  'Pasir Ris': [1.3731, 103.9493], 'Tampines': [1.3545, 103.9453],
  'Simei': [1.3432, 103.9533], 'Tanah Merah': [1.3272, 103.9464],
  'Bedok': [1.3240, 103.9300], 'Kembangan': [1.3209, 103.9129],
  'Eunos': [1.3197, 103.9030], 'Paya Lebar': [1.3176, 103.8932],
  'Aljunied': [1.3165, 103.8829], 'Kallang': [1.3114, 103.8715],
  'Lavender': [1.3072, 103.8630], 'Bugis': [1.3009, 103.8559],
  'Tanjong Pagar': [1.2764, 103.8463], 'Outram Park': [1.2802, 103.8394],
  'Tiong Bahru': [1.2861, 103.8270], 'Redhill': [1.2895, 103.8168],
  'Queenstown': [1.2946, 103.8060], 'Commonwealth': [1.3024, 103.7983],
  'Buona Vista': [1.3074, 103.7901], 'Dover': [1.3114, 103.7786],
  'Clementi': [1.3151, 103.7653], 'Chinese Garden': [1.3424, 103.7327],
  'Lakeside': [1.3443, 103.7210], 'Boon Lay': [1.3386, 103.7060],
  'Pioneer': [1.3376, 103.6973], 'Joo Koon': [1.3279, 103.6780],
  'Expo': [1.3351, 103.9617], 'Changi Airport': [1.3574, 103.9885],
  'Bartley': [1.3427, 103.8802], 'Serangoon': [1.3498, 103.8735],
  'Lorong Chuan': [1.3515, 103.8641], 'Marymount': [1.3488, 103.8393],
  'Caldecott': [1.3374, 103.8396], 'Botanic Gardens': [1.3224, 103.8152],
  'Farrer Road': [1.3177, 103.8074], 'Holland Village': [1.3112, 103.7960],
  'one-north': [1.2997, 103.7870], 'Kent Ridge': [1.2936, 103.7845],
  'Haw Par Villa': [1.2826, 103.7821], 'Pasir Panjang': [1.2760, 103.7916],
  'Labrador Park': [1.2722, 103.8026], 'Telok Blangah': [1.2707, 103.8098],
  'HarbourFront': [1.2654, 103.8226], 'Bayfront': [1.2814, 103.8590],
  'Promenade': [1.2934, 103.8610], 'Nicoll Highway': [1.3004, 103.8635],
  'Stadium': [1.3027, 103.8753], 'Mountbatten': [1.3063, 103.8825],
  'Dakota': [1.3085, 103.8887], 'MacPherson': [1.3265, 103.8900],
  'Tai Seng': [1.3360, 103.8880],
  'Bukit Panjang': [1.3786, 103.7618], 'Cashew': [1.3690, 103.7645],
  'Hillview': [1.3624, 103.7676], 'Beauty World': [1.3408, 103.7757],
  'King Albert Park': [1.3355, 103.7831], 'Sixth Avenue': [1.3310, 103.7972],
  'Tan Kah Kee': [1.3264, 103.8075], 'Stevens': [1.3201, 103.8260],
  'Rochor': [1.3037, 103.8525], 'Little India': [1.3063, 103.8492],
  'Jalan Besar': [1.3055, 103.8554], 'Bendemeer': [1.3148, 103.8630],
  'Geylang Bahru': [1.3214, 103.8718], 'Mattar': [1.3269, 103.8830],
  'Ubi': [1.3298, 103.8993], 'Kaki Bukit': [1.3349, 103.9080],
  'Bedok North': [1.3346, 103.9180], 'Bedok Reservoir': [1.3365, 103.9321],
  'Tampines West': [1.3455, 103.9385], 'Tampines East': [1.3561, 103.9546],
  'Upper Changi': [1.3418, 103.9614],
  'Punggol': [1.4052, 103.9024], 'Sengkang': [1.3917, 103.8955],
  'Buangkok': [1.3831, 103.8929], 'Hougang': [1.3713, 103.8924],
  'Kovan': [1.3601, 103.8852], 'Boon Keng': [1.3194, 103.8617],
  'Potong Pasir': [1.3314, 103.8687], 'Woodleigh': [1.3391, 103.8710],
  'Farrer Park': [1.3125, 103.8546], 'Clarke Quay': [1.2886, 103.8467],
  'Chinatown': [1.2845, 103.8440],
  'Woodlands North': [1.4486, 103.7854], 'Woodlands South': [1.4271, 103.7936],
  'Springleaf': [1.3973, 103.8189], 'Lentor': [1.3847, 103.8365],
  'Mayflower': [1.3718, 103.8381], 'Bright Hill': [1.3633, 103.8333],
  'Upper Thomson': [1.3539, 103.8331], 'Napier': [1.3066, 103.8213],
  'Orchard Boulevard': [1.3023, 103.8270], 'Great World': [1.2934, 103.8345],
  'Havelock': [1.2888, 103.8365], 'Maxwell': [1.2797, 103.8453],
  'Shenton Way': [1.2765, 103.8508], 'Gardens by the Bay': [1.2824, 103.8649],
  'Tanjong Rhu': [1.2986, 103.8733], 'Katong Park': [1.3010, 103.8853],
  'Tanjong Katong': [1.3059, 103.8944], 'Marine Parade': [1.3029, 103.9055],
  'Marine Terrace': [1.3065, 103.9135], 'Siglap': [1.3118, 103.9248],
  'Bayshore': [1.3187, 103.9398], 'Bedok South': [1.3178, 103.9445],
  'Sungei Bedok': [1.3244, 103.9531],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function findNearestMRT(lat: number, lng: number): string {
  if (!lat || !lng || lat === 0 || lng === 0) return ''
  let nearest = ''
  let minDist = Infinity
  for (const [name, [sLat, sLng]] of Object.entries(MRT_STATIONS)) {
    const dist = haversineDistance(lat, lng, sLat, sLng)
    if (dist < minDist) { minDist = dist; nearest = name }
  }
  if (nearest && minDist < 3000) {
    const mins = Math.round(minDist / 80)
    return `${nearest} MRT · ${mins} mins (${Math.round(minDist)}m)`
  }
  return nearest ? `${nearest} MRT` : ''
}

function estimateBaths(beds: number | null, propType: string): number {
  if (!beds) return propType === 'Landed' ? 3 : 1
  if (beds <= 1) return 1
  if (beds <= 2) return propType === 'Landed' ? 2 : 1
  if (beds <= 3) return 2
  if (beds <= 4) return propType === 'Landed' ? 4 : 3
  return propType === 'Landed' ? 5 : 3
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const geocodeCache = new Map<string, { lat: number; lng: number }>()

async function geocodeAddress(streetName: string, projectName: string): Promise<{ lat: number; lng: number }> {
  const queries = [`${streetName} Singapore`, `${projectName} Singapore`, streetName, projectName]
  for (const query of queries) {
    const key = query.toLowerCase().trim()
    if (geocodeCache.has(key)) return geocodeCache.get(key)!
    try {
      const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
      const res = await fetch(url)
      if (!res.ok) { await sleep(GEOCODE_DELAY_MS * 2); continue }
      const data = await res.json()
      if (data.found > 0 && data.results?.length > 0) {
        const r = data.results[0]
        const lat = parseFloat(r.LATITUDE)
        const lng = parseFloat(r.LONGITUDE)
        if (lat > 1.0 && lat < 1.5 && lng > 103.5 && lng < 104.1) {
          const coords = { lat, lng }
          geocodeCache.set(key, coords)
          return coords
        }
      }
    } catch { /* try next */ }
    await sleep(GEOCODE_DELAY_MS)
  }
  return { lat: 0, lng: 0 }
}

// ─── CSV Parsing ─────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes }
    else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' }
    else { current += char }
  }
  values.push(current.trim())
  return values
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ─── Adjust properties_fixed.csv ─────────────────────────────────────────────

async function adjustPropertiesFixedCSV() {
  const filePath = path.join(DATA_DIR, 'properties_fixed.csv')
  if (!fs.existsSync(filePath)) {
    console.log('properties_fixed.csv not found, skipping')
    return
  }

  console.log('Adjusting properties_fixed.csv...')
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  if (lines.length < 2) return

  const headers = parseCSVLine(lines[0])
  const colIdx = (name: string) => headers.indexOf(name)

  const iRent = colIdx('rental_price')
  const iLease = colIdx('lease_date')
  const iDistrict = colIdx('district')
  const iBaths = colIdx('baths')
  const iBeds = colIdx('beds')
  const iType = colIdx('property_type')
  const iLat = colIdx('latitude')
  const iLng = colIdx('longitude')
  const iMrt = colIdx('mrt')
  const iStreet = colIdx('street_name')
  const iName = colIdx('property_name')
  const iUpdated = colIdx('updated_at')

  let priceAdjusted = 0
  let bathsFilled = 0
  let geocoded = 0
  let mrtFilled = 0
  const now = new Date().toISOString()

  // Collect addresses that need geocoding
  const needsGeocode: { idx: number; street: string; name: string }[] = []

  const parsedLines: string[][] = [headers]
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i])
    if (fields.length !== headers.length) {
      parsedLines.push(fields)
      continue
    }

    // 1. Price adjustment
    if (fields[iLease] === 'Dec-24') {
      const district = parseInt(fields[iDistrict]) || null
      const rent = parseInt(fields[iRent]) || 0
      if (rent > 0) {
        fields[iRent] = String(Math.round(rent * getAdjustment(district)))
        priceAdjusted++
      }
      fields[iLease] = 'Jan-26'
      fields[iUpdated] = now
    }

    // 2. Fill missing baths
    if (!fields[iBaths] || fields[iBaths] === '' || fields[iBaths] === '0') {
      const beds = parseInt(fields[iBeds]) || null
      fields[iBaths] = String(estimateBaths(beds, fields[iType]))
      bathsFilled++
    }

    // 3. Fill MRT if we have coords but no MRT
    const lat = parseFloat(fields[iLat]) || 0
    const lng = parseFloat(fields[iLng]) || 0
    if (lat !== 0 && lng !== 0 && (!fields[iMrt] || fields[iMrt] === '')) {
      fields[iMrt] = findNearestMRT(lat, lng)
      if (fields[iMrt]) mrtFilled++
    }

    // 4. Mark for geocoding if lat/lng are missing
    if (DO_GEOCODE && (lat === 0 || lng === 0)) {
      needsGeocode.push({ idx: parsedLines.length, street: fields[iStreet], name: fields[iName] })
    }

    parsedLines.push(fields)
  }

  // 5. Geocode missing addresses
  if (DO_GEOCODE && needsGeocode.length > 0) {
    // Load cache
    const cachePath = path.join(DATA_DIR, '.geocode-cache.json')
    if (fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
        for (const [k, v] of Object.entries(cached)) {
          geocodeCache.set(k, v as { lat: number; lng: number })
        }
        console.log(`  Loaded ${geocodeCache.size} cached geocode results`)
      } catch { /* ignore */ }
    }

    // Deduplicate by address
    const uniqueAddrs = new Map<string, { street: string; name: string }>()
    for (const item of needsGeocode) {
      const key = `${item.street}|||${item.name}`.toUpperCase()
      if (!uniqueAddrs.has(key)) uniqueAddrs.set(key, item)
    }

    console.log(`  Geocoding ${uniqueAddrs.size} unique addresses (${needsGeocode.length} records)...`)
    let done = 0
    const addrCoords = new Map<string, { lat: number; lng: number }>()

    for (const [key, addr] of uniqueAddrs) {
      const coords = await geocodeAddress(addr.street, addr.name)
      addrCoords.set(key, coords)
      done++
      if (done % 50 === 0) console.log(`  Geocoded ${done}/${uniqueAddrs.size}...`)
      await sleep(GEOCODE_DELAY_MS)
    }

    // Apply geocode results
    for (const item of needsGeocode) {
      const key = `${item.street}|||${item.name}`.toUpperCase()
      const coords = addrCoords.get(key)
      if (coords && coords.lat !== 0) {
        const fields = parsedLines[item.idx]
        fields[iLat] = String(coords.lat)
        fields[iLng] = String(coords.lng)
        fields[iMrt] = findNearestMRT(coords.lat, coords.lng)
        geocoded++
        if (fields[iMrt]) mrtFilled++
      }
    }

    // Save cache
    const cacheObj: Record<string, { lat: number; lng: number }> = {}
    for (const [k, v] of geocodeCache) cacheObj[k] = v
    fs.writeFileSync(cachePath, JSON.stringify(cacheObj))
    console.log(`  Saved geocode cache (${geocodeCache.size} entries)`)
  }

  // Write back
  const output = parsedLines.map(fields =>
    fields.map((f, i) => {
      if (i === iMrt || i === iName || i === iStreet) return escapeCSV(f)
      return f
    }).join(',')
  ).join('\n')

  fs.writeFileSync(filePath, output)
  console.log(`  Prices adjusted: ${priceAdjusted}`)
  console.log(`  Baths filled: ${bathsFilled}`)
  console.log(`  Geocoded: ${geocoded}`)
  console.log(`  MRT filled: ${mrtFilled}`)
}

// ─── Adjust processed-properties.json ────────────────────────────────────────

function adjustProcessedJSON() {
  const filePath = path.join(DATA_DIR, 'processed-properties.json')
  if (!fs.existsSync(filePath)) {
    console.log('\nprocessed-properties.json not found, skipping')
    return
  }

  console.log('\nAdjusting processed-properties.json...')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  let adjusted = 0
  for (const record of data) {
    if (record.lease_date === 'Dec-24' && record.rental_price) {
      record.rental_price = Math.round(record.rental_price * getAdjustment(record.district))
      record.lease_date = 'Jan-26'
      adjusted++
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  console.log(`  Adjusted: ${adjusted} records`)

  // Summary
  const byDistrict = new Map<number, number[]>()
  for (const r of data) {
    if (r.district && r.rental_price) {
      if (!byDistrict.has(r.district)) byDistrict.set(r.district, [])
      byDistrict.get(r.district)!.push(r.rental_price)
    }
  }
  console.log('\n  District summary:')
  for (const [d, prices] of [...byDistrict.entries()].sort((a, b) => a[0] - b[0])) {
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
    console.log(`    D${String(d).padStart(2)}: ${String(prices.length).padStart(5)} props, avg $${String(avg).padStart(5)}, range $${Math.min(...prices)}-$${Math.max(...prices)}`)
  }
}

// ─── Adjust category CSVs ────────────────────────────────────────────────────

function adjustCategoryCSV(filename: string) {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) {
    console.log(`\n${filename} not found, skipping`)
    return
  }

  console.log(`\nAdjusting ${filename}...`)
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  if (lines.length < 2) return

  const cols = parseCSVLine(lines[0])
  const districtIdx = cols.indexOf('Postal District')
  const rentIdx = cols.indexOf('Monthly Rent ($)')
  const leaseIdx = cols.indexOf('Lease Commencement Date')

  if (districtIdx === -1 || rentIdx === -1 || leaseIdx === -1) {
    console.log(`  Could not find required columns`)
    return
  }

  let adjusted = 0
  const newLines = [lines[0]]

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i])
    if (fields.length !== cols.length) { newLines.push(lines[i]); continue }

    if (fields[leaseIdx] === 'Dec-24') {
      const district = parseInt(fields[districtIdx]) || null
      const rent = parseInt(fields[rentIdx].replace(/,/g, '')) || 0
      if (rent > 0) {
        const newRent = Math.round(rent * getAdjustment(district))
        fields[rentIdx] = newRent.toLocaleString('en-US')
        fields[leaseIdx] = 'Jan-26'
        adjusted++
      }
    }

    newLines.push(fields.map((f, idx) => {
      if (idx === rentIdx && f.includes(',')) return `"${f}"`
      return f
    }).join(','))
  }

  fs.writeFileSync(filePath, newLines.join('\n'))
  console.log(`  Adjusted: ${adjusted} records`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Property Data Adjustment to Q1 2026 ===\n')
  console.log('Price adjustments:')
  console.log('  CCR (D1,2,4,6,9,10,11): +4.5%')
  console.log('  RCR (D3,5,7,8,12-15): +3.0%')
  console.log('  OCR (D16-28): +2.5%')
  console.log('  D21 (Clementi): +5.5%')
  console.log('  D26 (Upper Thomson): +0%')
  console.log(`\nGeocoding: ${DO_GEOCODE ? 'ENABLED (--geocode flag)' : 'DISABLED (run with --geocode to fill missing lat/lng)'}`)
  console.log('')

  await adjustPropertiesFixedCSV()
  adjustProcessedJSON()
  adjustCategoryCSV('Condo.csv')
  adjustCategoryCSV('HDB 1.csv')
  adjustCategoryCSV('HDB 2.csv')
  adjustCategoryCSV('Landed.csv')

  console.log('\n=== Done ===')
  console.log('\nNext steps:')
  console.log('1. Review the adjusted data files')
  console.log('2. Import to Supabase: npx tsx src/scripts/import-properties.ts')
  console.log('3. District stats will auto-update via the DB trigger')
  if (!DO_GEOCODE) {
    console.log('\nTip: Run with --geocode to fill missing lat/lng coordinates:')
    console.log('  npx tsx src/scripts/adjust-prices-2026.ts --geocode')
  }
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
