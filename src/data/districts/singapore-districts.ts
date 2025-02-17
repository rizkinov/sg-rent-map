import { districtBoundaries } from './boundaries'

export interface District {
  id: number
  name: string
  region: string
  center: {
    lat: number
    lng: number
  }
  boundaries: [number, number][] // Array of [lat, lng] coordinates forming the polygon
  avgPrice?: number // Make avgPrice optional
}

export const districtData: District[] = [
  // Central Region
  {
    id: 1,
    name: "Raffles Place, Marina, Cecil",
    region: "Central",
    center: { lat: 1.2830, lng: 103.8511 },
    boundaries: districtBoundaries[1]
  },
  {
    id: 2,
    name: "Tanjong Pagar, Chinatown",
    region: "Central",
    center: { lat: 1.2764, lng: 103.8446 },
    boundaries: districtBoundaries[2]
  },
  {
    id: 3,
    name: "Tiong Bahru, Alexandra, Queenstown",
    region: "Central",
    center: { lat: 1.2878, lng: 103.8320 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 4,
    name: "Mount Echo, River Valley",
    region: "Central",
    center: { lat: 1.2937, lng: 103.8357 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 5,
    name: "Newton, Novena",
    region: "Central",
    center: { lat: 1.3139, lng: 103.8377 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 6,
    name: "Farrer Park, High Street",
    region: "Central",
    center: { lat: 1.3031, lng: 103.8519 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 7,
    name: "Little India, Bugis",
    region: "Central",
    center: { lat: 1.3038, lng: 103.8554 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 8,
    name: "Farrer Road, Holland",
    region: "Central",
    center: { lat: 1.3294, lng: 103.8159 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },

  // East Region
  {
    id: 14,
    name: "Eunos, Geylang, Paya Lebar",
    region: "East",
    center: { lat: 1.3170, lng: 103.8930 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 15,
    name: "Katong, Joo Chiat, Amber Road",
    region: "East",
    center: { lat: 1.3030, lng: 103.9030 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 16,
    name: "Bedok, Upper East Coast",
    region: "East",
    center: { lat: 1.3236, lng: 103.9273 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 17,
    name: "Changi, Loyang",
    region: "East",
    center: { lat: 1.3450, lng: 103.9630 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 18,
    name: "Tampines, Pasir Ris",
    region: "East",
    center: { lat: 1.3530, lng: 103.9440 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },

  // North-East Region
  {
    id: 19,
    name: "Serangoon, Hougang, Punggol",
    region: "North-East",
    center: { lat: 1.3730, lng: 103.8930 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 20,
    name: "Bishan, Ang Mo Kio",
    region: "North-East",
    center: { lat: 1.3610, lng: 103.8480 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },

  // North Region
  {
    id: 25,
    name: "Kranji, Woodlands",
    region: "North",
    center: { lat: 1.4380, lng: 103.7890 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 26,
    name: "Upper Thomson, Mandai",
    region: "North",
    center: { lat: 1.4180, lng: 103.8120 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 27,
    name: "Yishun, Sembawang",
    region: "North",
    center: { lat: 1.4300, lng: 103.8350 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 28,
    name: "Seletar, Yio Chu Kang",
    region: "North",
    center: { lat: 1.3920, lng: 103.8780 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },

  // West Region
  {
    id: 21,
    name: "Clementi, Upper Bukit Timah",
    region: "West",
    center: { lat: 1.3330, lng: 103.7760 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 22,
    name: "Jurong, Boon Lay",
    region: "West",
    center: { lat: 1.3330, lng: 103.7220 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 23,
    name: "Bukit Batok, Choa Chu Kang",
    region: "West",
    center: { lat: 1.3590, lng: 103.7490 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 24,
    name: "Lim Chu Kang, Tengah",
    region: "West",
    center: { lat: 1.3940, lng: 103.7220 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },

  // Central Region (continued)
  {
    id: 9,
    name: "Orchard, River Valley",
    region: "Central",
    center: { lat: 1.3046, lng: 103.8318 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 10,
    name: "Bukit Timah, Holland Road, Tanglin",
    region: "Central",
    center: { lat: 1.3253, lng: 103.8169 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 11,
    name: "Newton, Novena, Thomson",
    region: "Central",
    center: { lat: 1.3174, lng: 103.8384 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 12,
    name: "Balestier, Toa Payoh, Serangoon",
    region: "Central",
    center: { lat: 1.3300, lng: 103.8500 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  },
  {
    id: 13,
    name: "Macpherson, Braddell",
    region: "Central",
    center: { lat: 1.3400, lng: 103.8700 },
    boundaries: [
      // ... more coordinates forming the district boundary
    ]
  }
];

export const regions = [
  "Central",
  "East",
  "North",
  "North-East",
  "West"
] as const;

export type Region = typeof regions[number];

// Helper function to get districts by region
export function getDistrictsByRegion(region: Region) {
  return districtData.filter(district => district.region === region);
}

// Add a log to check the boundaries
console.log('District boundaries check:', districtData.map(d => ({
  id: d.id,
  name: d.name,
  boundaryPoints: d.boundaries.length
}))) 