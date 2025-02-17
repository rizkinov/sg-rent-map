import fs from 'fs'
import path from 'path'
import { districtData } from '@/data/districts/singapore-districts'

// MRT to District mapping (partial list, can be expanded)
const mrtToDistrict: Record<string, number> = {
  // Central (1-2)
  'Raffles Place': 1,
  'Marina Bay': 1,
  'Tanjong Pagar': 2,
  'Telok Ayer': 2,
  'Downtown': 2,
  'Maxwell': 2,

  // Central (3-4)
  'Tiong Bahru': 3,
  'Redhill': 3,
  'Queenstown': 3,
  'Commonwealth': 3,
  'Outram Park': 3,
  'Harbourfront': 4,

  // Central (5-8)
  'Buona Vista': 5,
  'Dover': 5,
  'one-north': 5,
  'Kent Ridge': 5,
  'Haw Par Villa': 5,
  'Clarke Quay': 6,
  'Fort Canning': 6,
  'Bugis': 7,
  'Lavender': 8,
  'Bendemeer': 8,

  // Orchard (9-10)
  'Orchard': 9,
  'Somerset': 9,
  'Dhoby Ghaut': 9,
  'Newton': 10,
  'Stevens': 10,
  'Botanic Gardens': 10,

  // North-East (19-20)
  'Serangoon': 19,
  'Kovan': 19,
  'Hougang': 19,
  'Buangkok': 19,
  'Sengkang': 19,
  'Punggol': 19,
  'Ang Mo Kio': 20,
  'Bishan': 20,

  // East (14-18)
  'Paya Lebar': 14,
  'Eunos': 14,
  'Aljunied': 14,
  'Geylang': 14,
  'Dakota': 14,
  'Mountbatten': 15,
  'Katong': 15,
  'Marine Parade': 15,
  'Bedok': 16,
  'Tanah Merah': 16,
  'Tampines': 18,
  'Pasir Ris': 18,
  'Simei': 18,

  // West (21-23)
  'Clementi': 21,
  'Jurong East': 22,
  'Chinese Garden': 22,
  'Lakeside': 22,
  'Boon Lay': 22,
  'Pioneer': 22,
  'Joo Koon': 22,
  'Bukit Batok': 23,
  'Bukit Gombak': 23,
  'Choa Chu Kang': 23,

  // North (25-28)
  'Woodlands': 25,
  'Admiralty': 25,
  'Marsiling': 25,
  'Yishun': 27,
  'Khatib': 27,
  'Sembawang': 27,
  'Canberra': 27
}

// Area names to District mapping
const areaToDistrict: Record<string, number> = {
  'Raffles': 1,
  'Marina': 1,
  'Cecil': 1,
  'Tanjong Pagar': 2,
  'Chinatown': 2,
  'Tiong Bahru': 3,
  'Alexandra': 3,
  'Queenstown': 3,
  'Orchard': 9,
  'River Valley': 9,
  'Novena': 11,
  'Newton': 11,
  'Thomson': 11,
  'Toa Payoh': 12,
  'Balestier': 12,
  'Serangoon': 12,
  'Geylang': 14,
  'Paya Lebar': 14,
  'Katong': 15,
  'Joo Chiat': 15,
  'Bedok': 16,
  'Tampines': 18,
  'Pasir Ris': 18,
  'Hougang': 19,
  'Punggol': 19,
  'Ang Mo Kio': 20,
  'Clementi': 21,
  'Jurong': 22,
  'Boon Lay': 22,
  'Yishun': 27,
}

function guessDistrictFromMRT(mrtString: string | null): number | null {
  if (!mrtString) return null

  // Extract station name from MRT string
  // Example format: "EW 23CR 17\nClementi MRT · 9 mins (664m)"
  const match = mrtString.match(/([^·\n]+)MRT/)
  if (!match) return null

  const stationName = match[1].trim()

  // Check direct station match
  for (const [station, district] of Object.entries(mrtToDistrict)) {
    if (stationName.toLowerCase().includes(station.toLowerCase())) {
      return district
    }
  }

  // If no direct match, check the full MRT string
  for (const [station, district] of Object.entries(mrtToDistrict)) {
    if (mrtString.toLowerCase().includes(station.toLowerCase())) {
      return district
    }
  }

  return null
}

function guessDistrictFromName(propertyName: string | null): number | null {
  if (!propertyName) return null
  
  for (const [area, district] of Object.entries(areaToDistrict)) {
    if (propertyName.toLowerCase().includes(area.toLowerCase())) {
      return district
    }
  }
  return null
}

function guessBedrooms(property: RawProperty): number {
  if (property.beds) return property.beds
  
  // Guess based on bathrooms
  if (property.baths) {
    if (property.baths === 1) return 1
    if (property.baths === 2) return 2
    if (property.baths === 3) return 3
    if (property.baths >= 4) return 4
  }
  
  // Guess based on sqft
  if (property.sqft) {
    if (property.sqft < 500) return 1
    if (property.sqft < 800) return 2
    if (property.sqft < 1200) return 3
    if (property.sqft < 1800) return 4
    return 5
  }
  
  return 2 // Default guess
}

// Add interface for Property type
interface RawProperty {
  url: string
  property_name: string
  property_type: string | null
  district: string | number | null
  price: number
  beds: number | null
  baths: number | null
  sqft: number
  mrt: string | null
  completion_year: number | null
  timestamp: string
}

interface CleanedProperty extends RawProperty {
  property_type: 'Condo' | 'HDB' | 'Landed'
  district: number | null
  beds: number
}

// Read the original data
const propertyData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'src/data/properties.json'),
    'utf-8'
  )
) as RawProperty[]

// Clean and transform the data
const cleanedData = propertyData.map((property: RawProperty) => {
  // Clean property type
  const propertyType = property.property_type?.toLowerCase()
  const cleanedType = 
    propertyType?.includes('condo') ? 'Condo' :
    propertyType?.includes('hdb') ? 'HDB' :
    propertyType?.includes('landed') ? 'Landed' :
    'Condo' // Default to Condo if unknown

  // Guess district if missing
  let district: number | null = null
  if (property.district) {
    if (typeof property.district === 'number') {
      district = property.district
    } else if (typeof property.district === 'string' && property.district.startsWith('D')) {
      district = parseInt(property.district.substring(1))
    }
  }

  if (!district) {
    district = 
      guessDistrictFromMRT(property.mrt) ||
      guessDistrictFromName(property.property_name)
  }

  // Guess bedrooms if missing
  const bedrooms = guessBedrooms(property)

  const cleanedProperty: CleanedProperty = {
    ...property,
    property_type: cleanedType,
    district: district,
    beds: bedrooms,
    property_name: property.property_name?.trim() || 'Unnamed Property'
  }

  return cleanedProperty
}) as CleanedProperty[]

// Save the cleaned data
fs.writeFileSync(
  path.join(process.cwd(), 'src/data/cleaned-properties.json'),
  JSON.stringify(cleanedData, null, 2)
)

// Print statistics
const stats = {
  total: cleanedData.length,
  withDistrict: cleanedData.filter((p: CleanedProperty) => p.district).length,
  byPropertyType: {
    Condo: cleanedData.filter((p: CleanedProperty) => p.property_type === 'Condo').length,
    HDB: cleanedData.filter((p: CleanedProperty) => p.property_type === 'HDB').length,
    Landed: cleanedData.filter((p: CleanedProperty) => p.property_type === 'Landed').length,
  }
}

console.log('Cleaning complete!')
console.log('Statistics:', stats) 