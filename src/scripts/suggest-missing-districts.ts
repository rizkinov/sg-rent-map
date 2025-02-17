import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { PropertyRecord } from '@/types/supabase'
import type { PropertyType } from '@/types/property'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Group patterns by district number
const districtPatterns: Record<number, string[]> = {
  // Central (D1-8)
  1: ['raffles', 'marina', 'cecil'],
  2: ['tanjong pagar', 'chinatown', 'shenton'],
  6: ['clarke quay', 'city hall'],
  
  // Orchard/River Valley (D9)
  9: ['orchard', 'river valley', 'killiney', 'cairnhill', 'leonie', 'oxley', 'robertson', 'riversuites'],
  
  // Bukit Timah/Holland (D10)
  10: ['bukit timah', 'holland', 'balmoral', 'ardmore', 'nassim', 'tanglin', 'sixth avenue', 'king albert'],
  
  // Newton/Novena (D11)
  11: ['newton', 'novena', 'thomson', 'chancery', 'dunearn'],
  
  // Balestier/Toa Payoh (D12)
  12: ['balestier', 'toa payoh', 'boon teck', 'shaw'],
  
  // MacPherson/Braddell (D13)
  13: ['macpherson', 'braddell', 'potong pasir'],
  
  // Geylang/Eunos (D14)
  14: ['geylang', 'eunos', 'paya lebar'],
  
  // East Coast/Marine Parade (D15)
  15: ['marine', 'tanjong rhu', 'siglap', 'east coast', 'katong', 'meyer', 'amber', 'mountbatten'],
  
  // Bedok/Upper East Coast (D16)
  16: ['bedok', 'upper east coast', 'bayshore', 'tanah merah'],
  
  // Changi/Loyang (D17)
  17: ['changi', 'loyang'],
  
  // Tampines/Pasir Ris (D18)
  18: ['tampines', 'pasir ris'],
  
  // Serangoon/Hougang/Punggol (D19)
  19: ['serangoon', 'hougang', 'punggol', 'sengkang', 'lorong chuan', 'kovan'],
  
  // Bishan/Ang Mo Kio (D20)
  20: ['bishan', 'ang mo kio', 'marymount'],
  
  // Clementi/West Coast (D21)
  21: ['clementi', 'west coast', 'hume', 'ulu pandan', 'sunset way'],
  
  // Jurong/Boon Lay (D22)
  22: ['jurong', 'boon lay', 'lakeside', 'toh tuck', 'yuan ching'],
  
  // Bukit Batok/Choa Chu Kang (D23)
  23: ['bukit batok', 'hillview', 'dairy farm', 'choa chu kang', 'bukit panjang'],
  
  // Lim Chu Kang/Tengah (D24)
  24: ['lim chu kang', 'tengah', 'kranji', 'sungei kadut']
}

interface Suggestion {
  id: string
  name: string
  suggestedDistrict: number
  confidence: 'high' | 'medium' | 'low'
  reason: string
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

  const suggestions: Suggestion[] = []

  for (const property of properties) {
    const name = property.property_name.toLowerCase()
    let suggestedDistrict: number | null = null
    let confidence: 'high' | 'medium' | 'low' = 'low'
    let reason = ''

    // Check against known patterns
    for (const [district, patterns] of Object.entries(districtPatterns)) {
      for (const pattern of patterns) {
        if (name.includes(pattern.toLowerCase())) {
          suggestedDistrict = parseInt(district)
          confidence = 'high'
          reason = `Contains location keyword "${pattern}"`
          break
        }
      }
      if (suggestedDistrict) break
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

  // Group and display suggestions by confidence level
  console.log('=== District Suggestions ===')
  for (const level of ['high', 'medium', 'low'] as const) {
    const levelSuggestions = suggestions.filter(s => s.confidence === level)
    if (levelSuggestions.length > 0) {
      console.log(`\n${level.toUpperCase()} confidence suggestions:`)
      levelSuggestions.forEach(s => {
        console.log(`- ${s.name}:`)
        console.log(`  District ${s.suggestedDistrict} (${s.reason})`)
      })
    }
  }

  console.log(`\nTotal suggestions: ${suggestions.length}`)
  console.log(`High confidence: ${suggestions.filter(s => s.confidence === 'high').length}`)
  console.log(`Medium confidence: ${suggestions.filter(s => s.confidence === 'medium').length}`)
}

suggestDistricts()
  .then(() => console.log('\nAnalysis completed'))
  .catch(error => console.error('Analysis failed:', error)) 