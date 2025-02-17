import { supabase } from '@/lib/supabase/server'

// Expanded location patterns
const districtPatterns = {
  // Central (D1-8)
  'raffles': 1, 'marina': 1, 'cecil': 1,
  'tanjong pagar': 2, 'chinatown': 2, 'shenton': 2,
  'clarke quay': 6, 'city hall': 6,
  
  // Orchard/River Valley (D9)
  'orchard': 9, 'river valley': 9, 'killiney': 9,
  'cairnhill': 9, 'leonie': 9, 'oxley': 9,
  'robertson': 9, 'riversuites': 9,
  
  // Bukit Timah/Holland (D10)
  'bukit timah': 10, 'holland': 10, 'balmoral': 10,
  'ardmore': 10, 'nassim': 10, 'tanglin': 10,
  'sixth avenue': 10, 'king albert': 10,
  
  // Newton/Novena (D11)
  'newton': 11, 'novena': 11, 'thomson': 11,
  'chancery': 11, 'dunearn': 11,
  
  // Balestier/Toa Payoh (D12)
  'balestier': 12, 'toa payoh': 12, 'serangoon': 12,
  'boon teck': 12, 'shaw': 12,
  
  // MacPherson/Braddell (D13)
  'macpherson': 13, 'braddell': 13, 'potong pasir': 13,
  
  // Geylang/Eunos (D14)
  'geylang': 14, 'eunos': 14, 'paya lebar': 14,
  
  // East Coast/Marine Parade (D15)
  'marine': 15, 'tanjong rhu': 15, 'siglap': 15,
  'east coast': 15, 'katong': 15, 'meyer': 15,
  'amber': 15, 'mountbatten': 15,
  
  // Bedok/Upper East Coast (D16)
  'bedok': 16, 'upper east coast': 16, 'bayshore': 16,
  'tanah merah': 16,
  
  // Changi/Loyang (D17)
  'changi': 17, 'loyang': 17,
  
  // Tampines/Pasir Ris (D18)
  'tampines': 18, 'pasir ris': 18,
  
  // Serangoon/Hougang/Punggol (D19)
  'serangoon': 19, 'hougang': 19, 'punggol': 19,
  'sengkang': 19, 'lorong chuan': 19, 'kovan': 19,
  
  // Bishan/Ang Mo Kio (D20)
  'bishan': 20, 'ang mo kio': 20, 'marymount': 20,
  
  // Clementi/West Coast (D21)
  'clementi': 21, 'west coast': 21, 'hume': 21,
  'ulu pandan': 21, 'sunset way': 21,
  
  // Jurong/Boon Lay (D22)
  'jurong': 22, 'boon lay': 22, 'lakeside': 22,
  'toh tuck': 22, 'yuan ching': 22,
  
  // Bukit Batok/Choa Chu Kang (D23)
  'bukit batok': 23, 'hillview': 23, 'dairy farm': 23,
  'choa chu kang': 23, 'bukit panjang': 23,
  
  // Lim Chu Kang/Tengah (D24)
  'lim chu kang': 24, 'tengah': 24, 'kranji': 24,
  'sungei kadut': 24
}

async function suggestDistricts() {
  console.log('Fetching properties without districts...\n')

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, property_name, district')
    .is('district', null)

  if (error) {
    console.error('Error fetching properties:', error.message)
    return
  }

  console.log(`Found ${properties.length} properties without districts\n`)

  const suggestions: { id: number; name: string; suggestedDistrict: number; confidence: string; reason: string }[] = []

  for (const property of properties) {
    const name = property.property_name.toLowerCase()
    let suggestedDistrict: number | null = null
    let confidence = 'low'
    let reason = ''

    // Check against known patterns
    for (const [pattern, district] of Object.entries(districtPatterns)) {
      if (name.includes(pattern.toLowerCase())) {
        suggestedDistrict = district
        confidence = 'high'
        reason = `Contains location keyword "${pattern}"`
        break
      }
    }

    // Additional logic for specific cases
    if (!suggestedDistrict) {
      if (name.includes('riversuites') || name.includes('robertson')) {
        suggestedDistrict = 9
        confidence = 'high'
        reason = 'Near Singapore River'
      } else if (name.includes('gardens') && !name.includes('marine')) {
        suggestedDistrict = 10
        confidence = 'medium'
        reason = 'Many garden developments in District 10'
      } else if (name.includes('residences')) {
        // Look for nearby properties with districts
        const { data: nearby } = await supabase
          .from('properties')
          .select('district')
          .not('district', 'is', null)
          .textSearch('property_name', name.split(' ')[0])
          .limit(1)

        if (nearby?.length && nearby[0].district) {
          suggestedDistrict = nearby[0].district
          confidence = 'medium'
          reason = 'Based on nearby properties with similar names'
        }
      }
    }

    if (suggestedDistrict) {
      suggestions.push({
        id: property.id,
        name: property.property_name,
        suggestedDistrict,
        confidence,
        reason
      })
    }
  }

  // Sort by confidence
  suggestions.sort((a, b) => {
    const confidenceOrder = { high: 3, medium: 2, low: 1 }
    return confidenceOrder[b.confidence as keyof typeof confidenceOrder] - 
           confidenceOrder[a.confidence as keyof typeof confidenceOrder]
  })

  // Print suggestions
  console.log('=== District Suggestions ===')
  suggestions.forEach(s => {
    console.log(`\n${s.name}:`)
    console.log(`  Suggested District: ${s.suggestedDistrict}`)
    console.log(`  Confidence: ${s.confidence}`)
    console.log(`  Reason: ${s.reason}`)
  })

  console.log('\n=== Summary ===')
  console.log(`Total properties without districts: ${properties.length}`)
  console.log(`Suggestions made: ${suggestions.length}`)
  console.log(`High confidence: ${suggestions.filter(s => s.confidence === 'high').length}`)
  console.log(`Medium confidence: ${suggestions.filter(s => s.confidence === 'medium').length}`)

  // Ask if user wants to apply high confidence suggestions
  console.log('\nWould you like to apply the high confidence suggestions? (Create a new script for this)')
}

suggestDistricts()
  .then(() => console.log('\nAnalysis completed'))
  .catch(error => console.error('Analysis failed:', error)) 