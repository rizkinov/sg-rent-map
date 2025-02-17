import { districtBoundaries } from './boundaries'
import type { District } from '@/types/district'  // Import the shared type

// Re-export the District type
export type { District } from '@/types/district'

// Define the coordinate type
type Coordinate = [number, number]

// For districts without boundaries data, we'll create a simple boundary box
function createBoundaryBox(center: { lat: number, lng: number }, size: number = 0.01): Coordinate[] {
  const { lat, lng } = center
  return [
    [lat - size, lng - size],
    [lat - size, lng + size],
    [lat + size, lng + size],
    [lat + size, lng - size],
    [lat - size, lng - size], // Close the polygon
  ]
}

export const districtData: District[] = [
  // Central Region
  {
    id: 1,
    name: "Raffles Place, Marina, Cecil",
    region: "Central",
    center: { lat: 1.2830, lng: 103.8511 },
    boundaries: districtBoundaries[1] as Coordinate[],
    summary: "Prime central business district with luxury condos and offices"
  },
  {
    id: 2,
    name: "Tanjong Pagar, Chinatown",
    region: "Central",
    center: { lat: 1.2764, lng: 103.8446 },
    boundaries: districtBoundaries[2] as Coordinate[],
    summary: "Historic district with mix of heritage shophouses and modern developments"
  },
  {
    id: 3,
    name: "Tiong Bahru, Alexandra, Queenstown",
    region: "Central",
    center: { lat: 1.2878, lng: 103.8320 },
    boundaries: districtBoundaries[3] as Coordinate[],
    summary: "Mix of heritage and modern residential areas with good amenities"
  },
  {
    id: 4,
    name: "Mount Echo, River Valley",
    region: "Central",
    center: { lat: 1.2937, lng: 103.8357 },
    boundaries: districtBoundaries[4] as Coordinate[],
    summary: "Upscale residential area near Orchard Road"
  },
  {
    id: 5,
    name: "Newton, Novena",
    region: "Central",
    center: { lat: 1.3139, lng: 103.8377 },
    boundaries: districtBoundaries[5] as Coordinate[],
    summary: "Popular expat area with medical hub and good schools"
  },
  {
    id: 6,
    name: "Farrer Park, High Street",
    region: "Central",
    center: { lat: 1.3031, lng: 103.8519 },
    boundaries: districtBoundaries[6] as Coordinate[],
    summary: "Vibrant area with mix of heritage buildings and modern amenities"
  },
  {
    id: 7,
    name: "Little India, Bugis",
    region: "Central",
    center: { lat: 1.3038, lng: 103.8554 },
    boundaries: districtBoundaries[7] as Coordinate[],
    summary: "Cultural district with rich heritage and shopping options"
  },
  {
    id: 8,
    name: "Farrer Road, Holland",
    region: "Central",
    center: { lat: 1.3294, lng: 103.8159 },
    boundaries: districtBoundaries[8] as Coordinate[],
    summary: "Prestigious residential area with good schools"
  },

  // East Region
  {
    id: 14,
    name: "Eunos, Geylang, Paya Lebar",
    region: "East",
    center: { lat: 1.3170, lng: 103.8930 },
    boundaries: districtBoundaries[14] as Coordinate[],
    summary: "Diverse neighborhood with excellent food options"
  },
  {
    id: 15,
    name: "Katong, Joo Chiat, Amber Road",
    region: "East",
    center: { lat: 1.3030, lng: 103.9030 },
    boundaries: districtBoundaries[15] as Coordinate[],
    summary: "Heritage area known for Peranakan culture"
  },
  {
    id: 16,
    name: "Bedok, Upper East Coast",
    region: "East",
    center: { lat: 1.3236, lng: 103.9273 },
    boundaries: districtBoundaries[16] as Coordinate[],
    summary: "Popular residential area near East Coast Park"
  },
  {
    id: 17,
    name: "Changi, Loyang",
    region: "East",
    center: { lat: 1.3450, lng: 103.9630 },
    boundaries: districtBoundaries[17] as Coordinate[],
    summary: "Aviation hub with coastal living"
  },
  {
    id: 18,
    name: "Tampines, Pasir Ris",
    region: "East",
    center: { lat: 1.3530, lng: 103.9440 },
    boundaries: districtBoundaries[18] as Coordinate[],
    summary: "Major regional center with family-friendly amenities"
  },

  // North-East Region
  {
    id: 19,
    name: "Serangoon, Hougang, Punggol",
    region: "North-East",
    center: { lat: 1.3730, lng: 103.8930 },
    boundaries: districtBoundaries[19] as Coordinate[],
    summary: "Waterfront living with modern amenities"
  },
  {
    id: 20,
    name: "Bishan, Ang Mo Kio",
    region: "North-East",
    center: { lat: 1.3610, lng: 103.8480 },
    boundaries: districtBoundaries[20] as Coordinate[],
    summary: "Mature estates with excellent schools"
  },

  // North Region
  {
    id: 25,
    name: "Kranji, Woodlands",
    region: "North",
    center: { lat: 1.4380, lng: 103.7890 },
    boundaries: createBoundaryBox({ lat: 1.4380, lng: 103.7890 }),
    summary: "Gateway to Malaysia with waterfront developments"
  },
  {
    id: 26,
    name: "Upper Thomson, Mandai",
    region: "North",
    center: { lat: 1.4180, lng: 103.8120 },
    boundaries: createBoundaryBox({ lat: 1.4180, lng: 103.8120 }),
    summary: "Nature reserves and wildlife attractions"
  },
  {
    id: 27,
    name: "Yishun, Sembawang",
    region: "North",
    center: { lat: 1.4300, lng: 103.8350 },
    boundaries: createBoundaryBox({ lat: 1.4300, lng: 103.8350 }),
    summary: "Coastal living with upcoming developments"
  },
  {
    id: 28,
    name: "Seletar, Yio Chu Kang",
    region: "North",
    center: { lat: 1.3920, lng: 103.8780 },
    boundaries: createBoundaryBox({ lat: 1.3920, lng: 103.8780 }),
    summary: "Aviation heritage with peaceful residential areas"
  },

  // West Region
  {
    id: 21,
    name: "Clementi, Upper Bukit Timah",
    region: "West",
    center: { lat: 1.3330, lng: 103.7760 },
    boundaries: createBoundaryBox({ lat: 1.3330, lng: 103.7760 }),
    summary: "Educational hub with nature reserves nearby"
  },
  {
    id: 22,
    name: "Jurong, Boon Lay",
    region: "West",
    center: { lat: 1.3330, lng: 103.7220 },
    boundaries: createBoundaryBox({ lat: 1.3330, lng: 103.7220 }),
    summary: "Second CBD with lakeside living"
  },
  {
    id: 23,
    name: "Bukit Batok, Choa Chu Kang",
    region: "West",
    center: { lat: 1.3590, lng: 103.7490 },
    boundaries: createBoundaryBox({ lat: 1.3590, lng: 103.7490 }),
    summary: "Family-friendly neighborhoods with nature parks"
  },
  {
    id: 24,
    name: "Lim Chu Kang, Tengah",
    region: "West",
    center: { lat: 1.3940, lng: 103.7220 },
    boundaries: createBoundaryBox({ lat: 1.3940, lng: 103.7220 }),
    summary: "Future forest town with sustainable living"
  },

  // Central Region (continued)
  {
    id: 9,
    name: "Orchard, River Valley",
    region: "Central",
    center: { lat: 1.3046, lng: 103.8318 },
    boundaries: districtBoundaries[9] as Coordinate[],
    summary: "Prime shopping district with luxury residences"
  },
  {
    id: 10,
    name: "Bukit Timah, Holland Road, Tanglin",
    region: "Central",
    center: { lat: 1.3253, lng: 103.8169 },
    boundaries: districtBoundaries[10] as Coordinate[],
    summary: "Exclusive residential area with prestigious schools"
  },
  {
    id: 11,
    name: "Newton, Novena, Thomson",
    region: "Central",
    center: { lat: 1.3174, lng: 103.8384 },
    boundaries: districtBoundaries[11] as Coordinate[],
    summary: "Prime residential area with medical facilities"
  },
  {
    id: 12,
    name: "Balestier, Toa Payoh, Serangoon",
    region: "Central",
    center: { lat: 1.3300, lng: 103.8500 },
    boundaries: districtBoundaries[12] as Coordinate[],
    summary: "Mature estate with excellent connectivity"
  },
  {
    id: 13,
    name: "Macpherson, Braddell",
    region: "Central",
    center: { lat: 1.3400, lng: 103.8700 },
    boundaries: districtBoundaries[13] as Coordinate[],
    summary: "Established neighborhood with good amenities"
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