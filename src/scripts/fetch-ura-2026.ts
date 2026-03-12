/**
 * Fetch latest URA rental transaction data and produce properties_fixed.csv
 * ready for Supabase import.
 *
 * Full pipeline:
 *   1. Download rental CSV from data.gov.sg
 *   2. Geocode addresses via OneMap API (free, no key needed)
 *   3. Find nearest MRT station from coordinates
 *   4. Estimate bathrooms from bedrooms
 *   5. Generate UUIDs
 *   6. Output properties_fixed.csv matching exact Supabase schema
 *
 * Usage:
 *   npx tsx src/scripts/fetch-ura-2026.ts
 *
 * If data.gov.sg is unreachable, place the CSV manually at:
 *   src/data/ura-rental-2026-raw.csv
 * and re-run.
 */

import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'src/data')

// data.gov.sg dataset ID for private residential rental contracts (URA)
const DATASET_ID = 'd_c9f57187485a850908655db0e8cfe651'

// Rate limiting for OneMap API
const GEOCODE_DELAY_MS = 100 // 100ms between requests
const GEOCODE_BATCH_SIZE = 50 // Log progress every N geocodes
const MAX_RETRIES = 3

// ─── MRT Station Data (name → [lat, lng]) ───────────────────────────────────
// All operational MRT/LRT stations in Singapore as of 2026
const MRT_STATIONS: Record<string, [number, number]> = {
  // North-South Line (NS)
  'Jurong East': [1.3329, 103.7422],
  'Bukit Batok': [1.3490, 103.7496],
  'Bukit Gombak': [1.3587, 103.7519],
  'Choa Chu Kang': [1.3853, 103.7445],
  'Yew Tee': [1.3973, 103.7474],
  'Kranji': [1.4251, 103.7620],
  'Marsiling': [1.4326, 103.7740],
  'Woodlands': [1.4370, 103.7865],
  'Admiralty': [1.4406, 103.8009],
  'Sembawang': [1.4491, 103.8201],
  'Canberra': [1.4431, 103.8296],
  'Yishun': [1.4293, 103.8353],
  'Khatib': [1.4174, 103.8329],
  'Yio Chu Kang': [1.3817, 103.8449],
  'Ang Mo Kio': [1.3700, 103.8496],
  'Bishan': [1.3513, 103.8492],
  'Braddell': [1.3404, 103.8468],
  'Toa Payoh': [1.3327, 103.8473],
  'Novena': [1.3204, 103.8438],
  'Newton': [1.3138, 103.8378],
  'Orchard': [1.3045, 103.8318],
  'Somerset': [1.3006, 103.8387],
  'Dhoby Ghaut': [1.2994, 103.8456],
  'City Hall': [1.2931, 103.8519],
  'Raffles Place': [1.2836, 103.8514],
  'Marina Bay': [1.2764, 103.8546],
  'Marina South Pier': [1.2714, 103.8634],

  // East-West Line (EW)
  'Pasir Ris': [1.3731, 103.9493],
  'Tampines': [1.3545, 103.9453],
  'Simei': [1.3432, 103.9533],
  'Tanah Merah': [1.3272, 103.9464],
  'Bedok': [1.3240, 103.9300],
  'Kembangan': [1.3209, 103.9129],
  'Eunos': [1.3197, 103.9030],
  'Paya Lebar': [1.3176, 103.8932],
  'Aljunied': [1.3165, 103.8829],
  'Kallang': [1.3114, 103.8715],
  'Lavender': [1.3072, 103.8630],
  'Bugis': [1.3009, 103.8559],
  'Tanjong Pagar': [1.2764, 103.8463],
  'Outram Park': [1.2802, 103.8394],
  'Tiong Bahru': [1.2861, 103.8270],
  'Redhill': [1.2895, 103.8168],
  'Queenstown': [1.2946, 103.8060],
  'Commonwealth': [1.3024, 103.7983],
  'Buona Vista': [1.3074, 103.7901],
  'Dover': [1.3114, 103.7786],
  'Clementi': [1.3151, 103.7653],
  'Chinese Garden': [1.3424, 103.7327],
  'Lakeside': [1.3443, 103.7210],
  'Boon Lay': [1.3386, 103.7060],
  'Pioneer': [1.3376, 103.6973],
  'Joo Koon': [1.3279, 103.6780],
  'Tuas Crescent': [1.3210, 103.6490],
  'Tuas West Road': [1.3300, 103.6397],
  'Tuas Link': [1.3409, 103.6368],
  'Expo': [1.3351, 103.9617],
  'Changi Airport': [1.3574, 103.9885],

  // Circle Line (CC)
  'Bartley': [1.3427, 103.8802],
  'Serangoon': [1.3498, 103.8735],
  'Lorong Chuan': [1.3515, 103.8641],
  'Marymount': [1.3488, 103.8393],
  'Caldecott': [1.3374, 103.8396],
  'Botanic Gardens': [1.3224, 103.8152],
  'Farrer Road': [1.3177, 103.8074],
  'Holland Village': [1.3112, 103.7960],
  'one-north': [1.2997, 103.7870],
  'Kent Ridge': [1.2936, 103.7845],
  'Haw Par Villa': [1.2826, 103.7821],
  'Pasir Panjang': [1.2760, 103.7916],
  'Labrador Park': [1.2722, 103.8026],
  'Telok Blangah': [1.2707, 103.8098],
  'HarbourFront': [1.2654, 103.8226],
  'Bayfront': [1.2814, 103.8590],
  'Promenade': [1.2934, 103.8610],
  'Nicoll Highway': [1.3004, 103.8635],
  'Stadium': [1.3027, 103.8753],
  'Mountbatten': [1.3063, 103.8825],
  'Dakota': [1.3085, 103.8887],
  'MacPherson': [1.3265, 103.8900],
  'Tai Seng': [1.3360, 103.8880],

  // Downtown Line (DT)
  'Bukit Panjang': [1.3786, 103.7618],
  'Cashew': [1.3690, 103.7645],
  'Hillview': [1.3624, 103.7676],
  'Beauty World': [1.3408, 103.7757],
  'King Albert Park': [1.3355, 103.7831],
  'Sixth Avenue': [1.3310, 103.7972],
  'Tan Kah Kee': [1.3264, 103.8075],
  'Stevens': [1.3201, 103.8260],
  'Rochor': [1.3037, 103.8525],
  'Little India': [1.3063, 103.8492],
  'Jalan Besar': [1.3055, 103.8554],
  'Bendemeer': [1.3148, 103.8630],
  'Geylang Bahru': [1.3214, 103.8718],
  'Mattar': [1.3269, 103.8830],
  'Ubi': [1.3298, 103.8993],
  'Kaki Bukit': [1.3349, 103.9080],
  'Bedok North': [1.3346, 103.9180],
  'Bedok Reservoir': [1.3365, 103.9321],
  'Tampines West': [1.3455, 103.9385],
  'Tampines East': [1.3561, 103.9546],
  'Upper Changi': [1.3418, 103.9614],
  'Xilin': [1.3290, 103.9640],

  // North-East Line (NE)
  'Punggol': [1.4052, 103.9024],
  'Sengkang': [1.3917, 103.8955],
  'Buangkok': [1.3831, 103.8929],
  'Hougang': [1.3713, 103.8924],
  'Kovan': [1.3601, 103.8852],
  'Boon Keng': [1.3194, 103.8617],
  'Potong Pasir': [1.3314, 103.8687],
  'Woodleigh': [1.3391, 103.8710],
  'Farrer Park': [1.3125, 103.8546],
  'Clarke Quay': [1.2886, 103.8467],
  'Chinatown': [1.2845, 103.8440],

  // Thomson-East Coast Line (TE)
  'Woodlands North': [1.4486, 103.7854],
  'Woodlands South': [1.4271, 103.7936],
  'Springleaf': [1.3973, 103.8189],
  'Lentor': [1.3847, 103.8365],
  'Mayflower': [1.3718, 103.8381],
  'Bright Hill': [1.3633, 103.8333],
  'Upper Thomson': [1.3539, 103.8331],
  'Napier': [1.3066, 103.8213],
  'Orchard Boulevard': [1.3023, 103.8270],
  'Great World': [1.2934, 103.8345],
  'Havelock': [1.2888, 103.8365],
  'Maxwell': [1.2797, 103.8453],
  'Shenton Way': [1.2765, 103.8508],
  'Gardens by the Bay': [1.2824, 103.8649],
  'Tanjong Rhu': [1.2986, 103.8733],
  'Katong Park': [1.3010, 103.8853],
  'Tanjong Katong': [1.3059, 103.8944],
  'Marine Parade': [1.3029, 103.9055],
  'Marine Terrace': [1.3065, 103.9135],
  'Siglap': [1.3118, 103.9248],
  'Bayshore': [1.3187, 103.9398],
  'Bedok South': [1.3178, 103.9445],
  'Sungei Bedok': [1.3244, 103.9531],
  'Founders Memorial': [1.2893, 103.8682],

  // Jurong Region Line (JRL)
  'Choa Chu Kang West': [1.3858, 103.7350],
  'Tengah': [1.3707, 103.7234],
  'Tengah Plantation': [1.3610, 103.7152],
  'Tengah Park': [1.3521, 103.7205],
  'Bukit Batok West': [1.3460, 103.7340],
  'Tawas': [1.3400, 103.7415],
  'Nanyang Gateway': [1.3448, 103.6851],
  'Nanyang Crescent': [1.3467, 103.6937],
  'Peng Kang Hill': [1.3394, 103.7013],
  'Jurong Town Hall': [1.3332, 103.7450],
  'Jurong East Pool': [1.3374, 103.7405],
  'Enterprise': [1.3345, 103.7515],

  // Bukit Panjang LRT
  'South View': [1.3802, 103.7460],
  'Keat Hong': [1.3787, 103.7485],
  'Teck Whye': [1.3765, 103.7535],
  'Phoenix': [1.3786, 103.7573],
  'Petir': [1.3781, 103.7665],
  'Pending': [1.3762, 103.7714],
  'Bangkit': [1.3801, 103.7724],
  'Fajar': [1.3844, 103.7706],
  'Segar': [1.3876, 103.7697],
  'Jelapang': [1.3866, 103.7645],
  'Senja': [1.3828, 103.7624],

  // Sengkang LRT
  'Compassvale': [1.3944, 103.9002],
  'Rumbia': [1.3914, 103.9058],
  'Bakau': [1.3879, 103.9051],
  'Kangkar': [1.3836, 103.9022],
  'Ranggung': [1.3834, 103.8960],
  'Cheng Lim': [1.3967, 103.8936],
  'Farmway': [1.3979, 103.8892],
  'Kupang': [1.3982, 103.8818],
  'Thanggam': [1.3975, 103.8756],
  'Fernvale': [1.3919, 103.8764],
  'Layar': [1.3925, 103.8803],
  'Tongkang': [1.3894, 103.8861],
  'Renjong': [1.3868, 103.8903],

  // Punggol LRT
  'Cove': [1.3994, 103.9058],
  'Meridian': [1.3970, 103.9089],
  'Coral Edge': [1.3939, 103.9126],
  'Riviera': [1.3946, 103.9164],
  'Kadaloor': [1.3993, 103.9166],
  'Oasis': [1.4023, 103.9124],
  'Damai': [1.4052, 103.9083],
  'Sam Kee': [1.4098, 103.9050],
  'Teck Lee': [1.4125, 103.9063],
  'Punggol Point': [1.4170, 103.9067],
  'Samudera': [1.4161, 103.9020],
  'Nibong': [1.4117, 103.9002],
  'Sumang': [1.4085, 103.8985],
  'Soo Teck': [1.4054, 103.8972],
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawCSVRecord {
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
  id: string
  property_name: string
  property_type: 'Condo' | 'HDB' | 'Landed'
  district: number | null
  rental_price: number
  beds: number | null
  baths: number | null
  sqft: number
  mrt: string | null
  latitude: number
  longitude: number
  completion_year: string
  url: string
  created_at: string
  updated_at: string
  street_name: string
  lease_date: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapPropertyType(uraType: string): 'Condo' | 'HDB' | 'Landed' {
  const t = uraType.toLowerCase()
  if (t.includes('terrace') || t.includes('detached') || t.includes('bungalow')) return 'Landed'
  if (t.includes('executive condominium') || t.includes('condominium') || t.includes('apartment') || t.includes('non-landed')) return 'Condo'
  return 'HDB'
}

function parseSqftRange(sqft: string): number {
  const parts = sqft.replace(/,/g, '').split(/\s+to\s+/)
  if (parts.length === 2) {
    return Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2)
  }
  return parseInt(parts[0]) || 0
}

function parseRent(rent: string): number {
  return parseInt(rent.replace(/,/g, '')) || 0
}

function estimateBaths(beds: number | null, propertyType: 'Condo' | 'HDB' | 'Landed'): number {
  if (!beds) {
    return propertyType === 'Landed' ? 3 : 1
  }
  if (beds <= 1) return 1
  if (beds <= 2) return propertyType === 'Landed' ? 2 : 1
  if (beds <= 3) return 2
  if (beds <= 4) return propertyType === 'Landed' ? 4 : 3
  return propertyType === 'Landed' ? 5 : 3
}

function isRecent(leaseDate: string): boolean {
  const match = leaseDate.match(/(\w+)-(\d{2})/)
  if (!match) return false
  const year = parseInt(match[2])
  return year >= 25 // 2025+
}

// ─── CSV Parsing ─────────────────────────────────────────────────────────────

function parseCSV(csvText: string): RawCSVRecord[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const records: RawCSVRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
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

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
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
  return values
}

// ─── Geocoding via OneMap API ────────────────────────────────────────────────

// Cache to avoid re-geocoding the same address
const geocodeCache = new Map<string, { lat: number; lng: number }>()

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let geocodeAvailable: boolean | null = null

async function checkGeocodeAvailability(): Promise<boolean> {
  if (geocodeAvailable !== null) return geocodeAvailable
  console.log('  Testing OneMap API connectivity...')
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(
      'https://www.onemap.gov.sg/api/common/elastic/search?searchVal=Singapore&returnGeom=Y&getAddrDetails=Y&pageNum=1',
      { signal: controller.signal }
    )
    clearTimeout(timeout)
    geocodeAvailable = res.ok
    if (geocodeAvailable) console.log('  OneMap API is reachable!\n')
  } catch {
    geocodeAvailable = false
  }
  if (!geocodeAvailable) {
    console.log('  OneMap API is unreachable — skipping geocoding.')
    console.log('  Lat/lng will be 0,0; run again when network is available.\n')
  }
  return geocodeAvailable
}

async function geocodeAddress(
  streetName: string,
  projectName: string
): Promise<{ lat: number; lng: number }> {
  // Quick bail if API is known to be unreachable
  if (geocodeAvailable === false) return { lat: 0, lng: 0 }

  // First call: check connectivity
  if (geocodeAvailable === null) {
    if (!(await checkGeocodeAvailability())) return { lat: 0, lng: 0 }
  }

  // Build search query: try street name first, then project name
  const queries = [
    `${streetName} Singapore`,
    `${projectName} Singapore`,
    streetName,
    projectName,
  ]

  for (const query of queries) {
    const cacheKey = query.toLowerCase().trim()
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey)!
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)

      if (!res.ok) {
        await sleep(GEOCODE_DELAY_MS * 2)
        continue
      }

      const data = await res.json()

      if (data.found && data.found > 0 && data.results?.length > 0) {
        const result = data.results[0]
        const lat = parseFloat(result.LATITUDE)
        const lng = parseFloat(result.LONGITUDE)

        if (lat && lng && lat > 1.0 && lat < 1.5 && lng > 103.5 && lng < 104.1) {
          const coords = { lat, lng }
          geocodeCache.set(cacheKey, coords)
          return coords
        }
      }
    } catch {
      // Try next query
    }

    await sleep(GEOCODE_DELAY_MS)
  }

  return { lat: 0, lng: 0 }
}

// ─── Nearest MRT Lookup ─────────────────────────────────────────────────────

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function findNearestMRT(lat: number, lng: number): string | null {
  if (!lat || !lng || lat === 0 || lng === 0) return null

  let nearest: string | null = null
  let minDist = Infinity

  for (const [name, [sLat, sLng]] of Object.entries(MRT_STATIONS)) {
    const dist = haversineDistance(lat, lng, sLat, sLng)
    if (dist < minDist) {
      minDist = dist
      nearest = name
    }
  }

  if (nearest && minDist < 3000) {
    // Walking time estimate: ~80m per minute
    const walkMins = Math.round(minDist / 80)
    return `${nearest} MRT · ${walkMins} mins (${Math.round(minDist)}m)`
  }

  return nearest ? `${nearest} MRT` : null
}

// ─── Data Download ───────────────────────────────────────────────────────────

async function fetchDataset(): Promise<string> {
  const initUrl = `https://api-production.data.gov.sg/v2/public/api/datasets/${DATASET_ID}/initiate-download`
  console.log('Initiating download from data.gov.sg...')

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const initRes = await fetch(initUrl, { method: 'GET', signal: controller.signal })
      clearTimeout(timeout)
      if (!initRes.ok) throw new Error(`HTTP ${initRes.status}`)

      const initData = await initRes.json()
      let downloadUrl = initData.data?.url

      if (!downloadUrl) {
        // Try poll endpoint
        const pollUrl = `https://api-production.data.gov.sg/v2/public/api/datasets/${DATASET_ID}/poll-download`
        const ctrl2 = new AbortController()
        const t2 = setTimeout(() => ctrl2.abort(), 15000)
        const pollRes = await fetch(pollUrl, { method: 'GET', signal: ctrl2.signal })
        clearTimeout(t2)
        if (pollRes.ok) {
          const pollData = await pollRes.json()
          downloadUrl = pollData.data?.url
        }
      }

      if (downloadUrl) {
        console.log('Downloading CSV...')
        const csvRes = await fetch(downloadUrl)
        if (csvRes.ok) {
          return csvRes.text()
        }
      }

      throw new Error('No download URL available')
    } catch (err) {
      console.error(`Attempt ${attempt}/${MAX_RETRIES} failed:`, err)
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Retrying in ${delay / 1000}s...`)
        await sleep(delay)
      }
    }
  }

  throw new Error('Failed to download from data.gov.sg after retries')
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────

async function main() {
  console.log('=== URA 2026 Rental Data → Supabase Pipeline ===\n')

  // Step 1: Get raw data
  let csvText: string

  const localPath = path.join(DATA_DIR, 'ura-rental-2026-raw.csv')
  if (fs.existsSync(localPath)) {
    console.log('Using local file: ura-rental-2026-raw.csv')
    csvText = fs.readFileSync(localPath, 'utf-8')
  } else {
    try {
      csvText = await fetchDataset()
      // Save raw data locally for re-runs
      fs.writeFileSync(localPath, csvText)
      console.log('Saved raw data to ura-rental-2026-raw.csv for caching\n')
    } catch (err) {
      console.error('\nFailed to download data:', err)
      console.error('\nManual download instructions:')
      console.error('1. Go to: https://data.gov.sg/datasets/d_c9f57187485a850908655db0e8cfe651/view')
      console.error('2. Click "Download" to get the CSV')
      console.error('3. Save as: src/data/ura-rental-2026-raw.csv')
      console.error('4. Re-run this script\n')
      process.exit(1)
    }
  }

  // Step 2: Parse and filter
  const allRecords = parseCSV(csvText)
  console.log(`Parsed ${allRecords.length} total records`)

  const recentRecords = allRecords.filter(r => isRecent(r['Lease Commencement Date']))
  console.log(`Found ${recentRecords.length} records from 2025-2026`)

  const records = recentRecords.length > 0 ? recentRecords : allRecords
  if (recentRecords.length === 0) {
    console.warn('No 2025+ records found; using all records\n')
  }

  // Step 3: Build unique addresses for geocoding
  const uniqueAddresses = new Map<string, { streetName: string; projectName: string }>()
  for (const r of records) {
    const key = `${r['Street Name']}|||${r['Project Name']}`.toUpperCase()
    if (!uniqueAddresses.has(key)) {
      uniqueAddresses.set(key, {
        streetName: r['Street Name'],
        projectName: r['Project Name'],
      })
    }
  }

  console.log(`\nGeocoding ${uniqueAddresses.size} unique addresses via OneMap API...`)
  console.log('(This may take a while on first run; results are cached)\n')

  // Load geocode cache from disk if exists
  const cachePath = path.join(DATA_DIR, '.geocode-cache.json')
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
      for (const [key, val] of Object.entries(cached)) {
        geocodeCache.set(key, val as { lat: number; lng: number })
      }
      console.log(`Loaded ${geocodeCache.size} cached geocode results`)
    } catch {
      // Ignore corrupt cache
    }
  }

  let geocoded = 0
  let geocodeFailed = 0
  const addressCoords = new Map<string, { lat: number; lng: number }>()

  // Pre-check connectivity before iterating
  const canGeocode = await checkGeocodeAvailability()

  if (canGeocode) {
    for (const [key, addr] of uniqueAddresses) {
      const coords = await geocodeAddress(addr.streetName, addr.projectName)
      addressCoords.set(key, coords)

      geocoded++
      if (coords.lat === 0 && coords.lng === 0) {
        geocodeFailed++
      }

      if (geocoded % GEOCODE_BATCH_SIZE === 0) {
        console.log(`  Geocoded ${geocoded}/${uniqueAddresses.size} (${geocodeFailed} failed)`)
      }

      await sleep(GEOCODE_DELAY_MS)
    }
  } else {
    // Skip geocoding entirely — set all to 0,0
    for (const [key] of uniqueAddresses) {
      addressCoords.set(key, { lat: 0, lng: 0 })
    }
    geocoded = uniqueAddresses.size
    geocodeFailed = uniqueAddresses.size
  }

  console.log(`\nGeocoding complete: ${geocoded - geocodeFailed} success, ${geocodeFailed} failed`)

  // Save geocode cache to disk
  const cacheObj: Record<string, { lat: number; lng: number }> = {}
  for (const [k, v] of geocodeCache) {
    cacheObj[k] = v
  }
  fs.writeFileSync(cachePath, JSON.stringify(cacheObj))
  console.log('Saved geocode cache to .geocode-cache.json\n')

  // Step 4: Build processed properties
  const now = new Date().toISOString()
  const properties: ProcessedProperty[] = []

  for (const r of records) {
    const rent = parseRent(r['Monthly Rent ($)'])
    const sqft = parseSqftRange(r['Floor Area (SQFT)'])
    if (rent <= 0 || sqft <= 0) continue

    const district = parseInt(r['Postal District']) || null
    const beds = r['No of Bedroom'] === 'NA' ? null : (parseInt(r['No of Bedroom']) || null)
    const propertyType = mapPropertyType(r['Property Type'])

    const addrKey = `${r['Street Name']}|||${r['Project Name']}`.toUpperCase()
    const coords = addressCoords.get(addrKey) || { lat: 0, lng: 0 }
    const mrt = findNearestMRT(coords.lat, coords.lng)

    properties.push({
      id: randomUUID(),
      property_name: r['Project Name'],
      property_type: propertyType,
      district,
      rental_price: rent,
      beds,
      baths: estimateBaths(beds, propertyType),
      sqft,
      mrt: mrt || '',
      latitude: coords.lat,
      longitude: coords.lng,
      completion_year: '',
      url: '',
      created_at: now,
      updated_at: now,
      street_name: r['Street Name'],
      lease_date: r['Lease Commencement Date'],
    })
  }

  console.log(`Processed ${properties.length} valid URA (Condo/Landed) properties`)

  // Step 4b: Merge HDB data from properties_rows_corrected.csv
  const hdbSourcePath = path.join(DATA_DIR, 'properties_rows_corrected.csv')
  if (fs.existsSync(hdbSourcePath)) {
    console.log('\nMerging HDB data from properties_rows_corrected.csv...')
    const hdbContent = fs.readFileSync(hdbSourcePath, 'utf-8')
    const hdbLines = hdbContent.trim().split('\n')
    const hdbHeaders = parseCSVLine(hdbLines[0])

    const hIdx = (name: string) => hdbHeaders.indexOf(name)
    let hdbCount = 0

    for (let i = 1; i < hdbLines.length; i++) {
      const fields = parseCSVLine(hdbLines[i])
      if (fields.length !== hdbHeaders.length) continue

      const propType = fields[hIdx('property_type')]
      if (propType !== 'HDB') continue

      const rent = parseInt(fields[hIdx('rental_price')]) || 0
      const sqft = parseInt(fields[hIdx('sqft')]) || 0
      if (rent <= 0 || sqft <= 0) continue

      const district = parseInt(fields[hIdx('district')]) || null
      const beds = parseInt(fields[hIdx('beds')]) || null
      const baths = parseInt(fields[hIdx('baths')]) || null
      const lat = parseFloat(fields[hIdx('latitude')]) || 0
      const lng = parseFloat(fields[hIdx('longitude')]) || 0

      properties.push({
        id: fields[hIdx('id')] || randomUUID(),
        property_name: fields[hIdx('property_name')],
        property_type: 'HDB',
        district,
        rental_price: rent,
        beds,
        baths: baths || estimateBaths(beds, 'HDB'),
        sqft,
        mrt: fields[hIdx('mrt')] || findNearestMRT(lat, lng) || '',
        latitude: lat,
        longitude: lng,
        completion_year: fields[hIdx('completion_year')] || '',
        url: fields[hIdx('url')] || '',
        created_at: fields[hIdx('created_at')] || now,
        updated_at: now,
        street_name: fields[hIdx('street_name')] || '',
        lease_date: fields[hIdx('lease_date')] || '',
      })
      hdbCount++
    }

    console.log(`Added ${hdbCount} HDB records`)
  }

  console.log(`\nTotal: ${properties.length} properties\n`)

  // Step 5: Write properties_fixed.csv (exact format for import-properties.ts)
  const csvHeaders = [
    'id', 'property_name', 'property_type', 'district', 'rental_price',
    'beds', 'baths', 'sqft', 'mrt', 'latitude', 'longitude',
    'completion_year', 'url', 'created_at', 'updated_at',
    'street_name', 'lease_date'
  ]

  const csvLines = [csvHeaders.join(',')]
  for (const p of properties) {
    const values = [
      p.id,
      escapeCSV(p.property_name),
      p.property_type,
      p.district ?? '',
      p.rental_price,
      p.beds ?? '',
      p.baths ?? '',
      p.sqft,
      escapeCSV(p.mrt || ''),
      p.latitude,
      p.longitude,
      p.completion_year,
      p.url,
      p.created_at,
      p.updated_at,
      escapeCSV(p.street_name),
      p.lease_date,
    ]
    csvLines.push(values.join(','))
  }

  const outputPath = path.join(DATA_DIR, 'properties_fixed.csv')
  fs.writeFileSync(outputPath, csvLines.join('\n'))
  console.log(`Wrote properties_fixed.csv (${properties.length} records)`)

  // Also write the categorized CSVs for reference
  writeCategoryCSVs(records)

  // Also write processed-properties.json
  const jsonData = properties.map(p => ({
    property_name: p.property_name,
    property_type: p.property_type,
    district: p.district,
    rental_price: p.rental_price,
    beds: p.beds,
    sqft: p.sqft,
    street_name: p.street_name,
    lease_date: p.lease_date,
  }))
  fs.writeFileSync(
    path.join(DATA_DIR, 'processed-properties.json'),
    JSON.stringify(jsonData, null, 2)
  )
  console.log(`Wrote processed-properties.json (${jsonData.length} records)`)

  // Step 6: Print summary
  printSummary(properties)

  console.log('\n=== Pipeline Complete ===')
  console.log('\nNext steps:')
  console.log('1. Review: src/data/properties_fixed.csv')
  console.log('2. Import to Supabase: npx tsx src/scripts/import-properties.ts')
  console.log('3. District stats will auto-update via the DB trigger')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function writeCategoryCSVs(records: RawCSVRecord[]) {
  const csvHeader = 'Project Name,Street Name,Postal District,Property Type,No of Bedroom,Monthly Rent ($),Floor Area (SQM),Floor Area (SQFT),Lease Commencement Date'

  const condos: RawCSVRecord[] = []
  const hdb: RawCSVRecord[] = []
  const landed: RawCSVRecord[] = []

  for (const r of records) {
    const type = mapPropertyType(r['Property Type'])
    if (type === 'Landed') landed.push(r)
    else if (type === 'HDB') hdb.push(r)
    else condos.push(r)
  }

  const toLine = (r: RawCSVRecord) => [
    escapeCSV(r['Project Name']),
    escapeCSV(r['Street Name']),
    r['Postal District'],
    r['Property Type'],
    r['No of Bedroom'],
    r['Monthly Rent ($)'].includes(',') ? `"${r['Monthly Rent ($)']}"` : r['Monthly Rent ($)'],
    r['Floor Area (SQM)'],
    r['Floor Area (SQFT)'].includes(',') ? `"${r['Floor Area (SQFT)']}"` : r['Floor Area (SQFT)'],
    r['Lease Commencement Date'],
  ].join(',')

  fs.writeFileSync(path.join(DATA_DIR, 'Condo.csv'), [csvHeader, ...condos.map(toLine)].join('\n'))
  fs.writeFileSync(path.join(DATA_DIR, 'Landed.csv'), [csvHeader, ...landed.map(toLine)].join('\n'))

  const hdbMid = Math.ceil(hdb.length / 2)
  fs.writeFileSync(path.join(DATA_DIR, 'HDB 1.csv'), [csvHeader, ...hdb.slice(0, hdbMid).map(toLine)].join('\n'))
  fs.writeFileSync(path.join(DATA_DIR, 'HDB 2.csv'), [csvHeader, ...hdb.slice(hdbMid).map(toLine)].join('\n'))

  console.log(`Wrote category CSVs: ${condos.length} Condo, ${hdb.length} HDB, ${landed.length} Landed`)
}

function printSummary(properties: ProcessedProperty[]) {
  console.log('\n=== Data Summary ===')

  // By property type
  const byType = { Condo: 0, HDB: 0, Landed: 0 }
  for (const p of properties) byType[p.property_type]++
  console.log(`\nBy type: Condo ${byType.Condo}, HDB ${byType.HDB}, Landed ${byType.Landed}`)

  // Geocoding coverage
  const withCoords = properties.filter(p => p.latitude !== 0 && p.longitude !== 0).length
  const withMRT = properties.filter(p => p.mrt && p.mrt.length > 0).length
  console.log(`\nGeocoding: ${withCoords}/${properties.length} have coordinates (${Math.round(withCoords / properties.length * 100)}%)`)
  console.log(`MRT data: ${withMRT}/${properties.length} have nearest MRT`)

  // By district
  console.log('\nBy district:')
  const byDistrict = new Map<number, ProcessedProperty[]>()
  for (const p of properties) {
    if (p.district) {
      if (!byDistrict.has(p.district)) byDistrict.set(p.district, [])
      byDistrict.get(p.district)!.push(p)
    }
  }

  for (const [d, props] of [...byDistrict.entries()].sort((a, b) => a[0] - b[0])) {
    const prices = props.map(p => p.rental_price)
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
    console.log(`  D${String(d).padStart(2)}: ${String(props.length).padStart(5)} props, avg $${String(avg).padStart(5)}, range $${Math.min(...prices)}-$${Math.max(...prices)}`)
  }
}

main().catch(err => {
  console.error('Pipeline failed:', err)
  process.exit(1)
})
