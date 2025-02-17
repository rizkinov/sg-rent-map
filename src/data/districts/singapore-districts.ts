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
    summary: {
      property_count: 156,
      avg_price: 5200,
      property_types: {
        Condo: 89,
        HDB: 45,
        Landed: 22
      },
      price_range: {
        min: 3500,
        max: 8900
      },
      avg_size: 950
    }
  },
  {
    id: 2,
    name: "Tanjong Pagar, Chinatown",
    region: "Central",
    center: { lat: 1.2764, lng: 103.8446 },
    boundaries: districtBoundaries[2] as Coordinate[],
    summary: {
      property_count: 142,
      avg_price: 4800,
      property_types: {
        Condo: 95,
        HDB: 38,
        Landed: 9
      },
      price_range: {
        min: 3200,
        max: 7800
      },
      avg_size: 880
    }
  },
  {
    id: 3,
    name: "Tiong Bahru, Alexandra, Queenstown",
    region: "Central",
    center: { lat: 1.2878, lng: 103.8320 },
    boundaries: districtBoundaries[3] as Coordinate[],
    summary: {
      property_count: 135,
      avg_price: 4300,
      property_types: {
        Condo: 75,
        HDB: 52,
        Landed: 8
      },
      price_range: {
        min: 2800,
        max: 7200
      },
      avg_size: 920
    }
  },
  {
    id: 4,
    name: "Mount Echo, River Valley",
    region: "Central",
    center: { lat: 1.2937, lng: 103.8357 },
    boundaries: districtBoundaries[4] as Coordinate[],
    summary: {
      property_count: 128,
      avg_price: 5500,
      property_types: {
        Condo: 98,
        HDB: 12,
        Landed: 18
      },
      price_range: {
        min: 3800,
        max: 9200
      },
      avg_size: 1100
    }
  },
  {
    id: 5,
    name: "Newton, Novena",
    region: "Central",
    center: { lat: 1.3139, lng: 103.8377 },
    boundaries: districtBoundaries[5] as Coordinate[],
    summary: {
      property_count: 145,
      avg_price: 4900,
      property_types: {
        Condo: 92,
        HDB: 35,
        Landed: 18
      },
      price_range: {
        min: 3200,
        max: 8500
      },
      avg_size: 980
    }
  },
  {
    id: 6,
    name: "Farrer Park, High Street",
    region: "Central",
    center: { lat: 1.3031, lng: 103.8519 },
    boundaries: districtBoundaries[6] as Coordinate[],
    summary: {
      property_count: 132,
      avg_price: 4600,
      property_types: {
        Condo: 82,
        HDB: 42,
        Landed: 8
      },
      price_range: {
        min: 3000,
        max: 7500
      },
      avg_size: 900
    }
  },
  {
    id: 7,
    name: "Little India, Bugis",
    region: "Central",
    center: { lat: 1.3038, lng: 103.8554 },
    boundaries: districtBoundaries[7] as Coordinate[],
    summary: {
      property_count: 138,
      avg_price: 4200,
      property_types: {
        Condo: 78,
        HDB: 48,
        Landed: 12
      },
      price_range: {
        min: 2800,
        max: 7000
      },
      avg_size: 850
    }
  },
  {
    id: 8,
    name: "Farrer Road, Holland",
    region: "Central",
    center: { lat: 1.3294, lng: 103.8159 },
    boundaries: districtBoundaries[8] as Coordinate[],
    summary: {
      property_count: 165,
      avg_price: 5800,
      property_types: {
        Condo: 95,
        HDB: 35,
        Landed: 35
      },
      price_range: {
        min: 3800,
        max: 9500
      },
      avg_size: 1200
    }
  },

  // East Region
  {
    id: 14,
    name: "Eunos, Geylang, Paya Lebar",
    region: "East",
    center: { lat: 1.3170, lng: 103.8930 },
    boundaries: districtBoundaries[14] as Coordinate[],
    summary: {
      property_count: 158,
      avg_price: 3800,
      property_types: {
        Condo: 68,
        HDB: 82,
        Landed: 8
      },
      price_range: {
        min: 2500,
        max: 6800
      },
      avg_size: 850
    }
  },
  {
    id: 15,
    name: "Katong, Joo Chiat, Amber Road",
    region: "East",
    center: { lat: 1.3030, lng: 103.9030 },
    boundaries: districtBoundaries[15] as Coordinate[],
    summary: {
      property_count: 145,
      avg_price: 4200,
      property_types: {
        Condo: 85,
        HDB: 45,
        Landed: 15
      },
      price_range: {
        min: 2800,
        max: 7200
      },
      avg_size: 920
    }
  },
  {
    id: 16,
    name: "Bedok, Upper East Coast",
    region: "East",
    center: { lat: 1.3236, lng: 103.9273 },
    boundaries: districtBoundaries[16] as Coordinate[],
    summary: {
      property_count: 168,
      avg_price: 3900,
      property_types: {
        Condo: 72,
        HDB: 85,
        Landed: 11
      },
      price_range: {
        min: 2600,
        max: 6500
      },
      avg_size: 890
    }
  },
  {
    id: 17,
    name: "Changi, Loyang",
    region: "East",
    center: { lat: 1.3450, lng: 103.9630 },
    boundaries: districtBoundaries[17] as Coordinate[],
    summary: {
      property_count: 125,
      avg_price: 3500,
      property_types: {
        Condo: 55,
        HDB: 65,
        Landed: 5
      },
      price_range: {
        min: 2400,
        max: 5800
      },
      avg_size: 860
    }
  },
  {
    id: 18,
    name: "Tampines, Pasir Ris",
    region: "East",
    center: { lat: 1.3530, lng: 103.9440 },
    boundaries: districtBoundaries[18] as Coordinate[],
    summary: {
      property_count: 185,
      avg_price: 3600,
      property_types: {
        Condo: 65,
        HDB: 110,
        Landed: 10
      },
      price_range: {
        min: 2300,
        max: 5500
      },
      avg_size: 880
    }
  },

  // North-East Region
  {
    id: 19,
    name: "Serangoon, Hougang, Punggol",
    region: "North-East",
    center: { lat: 1.3730, lng: 103.8930 },
    boundaries: districtBoundaries[19] as Coordinate[],
    summary: {
      property_count: 195,
      avg_price: 3400,
      property_types: {
        Condo: 65,
        HDB: 120,
        Landed: 10
      },
      price_range: {
        min: 2200,
        max: 5200
      },
      avg_size: 920
    }
  },
  {
    id: 20,
    name: "Bishan, Ang Mo Kio",
    region: "North-East",
    center: { lat: 1.3610, lng: 103.8480 },
    boundaries: districtBoundaries[20] as Coordinate[],
    summary: {
      property_count: 175,
      avg_price: 3800,
      property_types: {
        Condo: 75,
        HDB: 90,
        Landed: 10
      },
      price_range: {
        min: 2500,
        max: 6000
      },
      avg_size: 950
    }
  },

  // North Region
  {
    id: 25,
    name: "Kranji, Woodlands",
    region: "North",
    center: { lat: 1.4380, lng: 103.7890 },
    boundaries: createBoundaryBox({ lat: 1.4380, lng: 103.7890 }),
    summary: {
      property_count: 155,
      avg_price: 2800,
      property_types: {
        Condo: 45,
        HDB: 105,
        Landed: 5
      },
      price_range: {
        min: 1800,
        max: 4500
      },
      avg_size: 880
    }
  },
  {
    id: 26,
    name: "Upper Thomson, Mandai",
    region: "North",
    center: { lat: 1.4180, lng: 103.8120 },
    boundaries: createBoundaryBox({ lat: 1.4180, lng: 103.8120 }),
    summary: {
      property_count: 125,
      avg_price: 3200,
      property_types: {
        Condo: 55,
        HDB: 55,
        Landed: 15
      },
      price_range: {
        min: 2200,
        max: 5000
      },
      avg_size: 950
    }
  },
  {
    id: 27,
    name: "Yishun, Sembawang",
    region: "North",
    center: { lat: 1.4300, lng: 103.8350 },
    boundaries: createBoundaryBox({ lat: 1.4300, lng: 103.8350 }),
    summary: {
      property_count: 165,
      avg_price: 2900,
      property_types: {
        Condo: 50,
        HDB: 108,
        Landed: 7
      },
      price_range: {
        min: 1900,
        max: 4800
      },
      avg_size: 900
    }
  },
  {
    id: 28,
    name: "Seletar, Yio Chu Kang",
    region: "North",
    center: { lat: 1.3920, lng: 103.8780 },
    boundaries: createBoundaryBox({ lat: 1.3920, lng: 103.8780 }),
    summary: {
      property_count: 135,
      avg_price: 3100,
      property_types: {
        Condo: 48,
        HDB: 75,
        Landed: 12
      },
      price_range: {
        min: 2000,
        max: 5200
      },
      avg_size: 920
    }
  },

  // West Region
  {
    id: 21,
    name: "Clementi, Upper Bukit Timah",
    region: "West",
    center: { lat: 1.3330, lng: 103.7760 },
    boundaries: createBoundaryBox({ lat: 1.3330, lng: 103.7760 }),
    summary: {
      property_count: 158,
      avg_price: 3600,
      property_types: {
        Condo: 68,
        HDB: 80,
        Landed: 10
      },
      price_range: {
        min: 2400,
        max: 5800
      },
      avg_size: 910
    }
  },
  {
    id: 22,
    name: "Jurong, Boon Lay",
    region: "West",
    center: { lat: 1.3330, lng: 103.7220 },
    boundaries: createBoundaryBox({ lat: 1.3330, lng: 103.7220 }),
    summary: {
      property_count: 175,
      avg_price: 3200,
      property_types: {
        Condo: 55,
        HDB: 112,
        Landed: 8
      },
      price_range: {
        min: 2100,
        max: 5200
      },
      avg_size: 880
    }
  },
  {
    id: 23,
    name: "Bukit Batok, Choa Chu Kang",
    region: "West",
    center: { lat: 1.3590, lng: 103.7490 },
    boundaries: createBoundaryBox({ lat: 1.3590, lng: 103.7490 }),
    summary: {
      property_count: 168,
      avg_price: 3000,
      property_types: {
        Condo: 48,
        HDB: 115,
        Landed: 5
      },
      price_range: {
        min: 2000,
        max: 4800
      },
      avg_size: 850
    }
  },
  {
    id: 24,
    name: "Lim Chu Kang, Tengah",
    region: "West",
    center: { lat: 1.3940, lng: 103.7220 },
    boundaries: createBoundaryBox({ lat: 1.3940, lng: 103.7220 }),
    summary: {
      property_count: 95,
      avg_price: 2800,
      property_types: {
        Condo: 25,
        HDB: 65,
        Landed: 5
      },
      price_range: {
        min: 1800,
        max: 4200
      },
      avg_size: 820
    }
  },

  // Central Region (continued)
  {
    id: 9,
    name: "Orchard, River Valley",
    region: "Central",
    center: { lat: 1.3046, lng: 103.8318 },
    boundaries: districtBoundaries[9] as Coordinate[],
    summary: {
      property_count: 185,
      avg_price: 6200,
      property_types: {
        Condo: 145,
        HDB: 15,
        Landed: 25
      },
      price_range: {
        min: 4200,
        max: 12000
      },
      avg_size: 1250
    }
  },
  {
    id: 10,
    name: "Bukit Timah, Holland Road, Tanglin",
    region: "Central",
    center: { lat: 1.3253, lng: 103.8169 },
    boundaries: districtBoundaries[10] as Coordinate[],
    summary: {
      property_count: 175,
      avg_price: 6500,
      property_types: {
        Condo: 95,
        HDB: 25,
        Landed: 55
      },
      price_range: {
        min: 4500,
        max: 15000
      },
      avg_size: 1500
    }
  },
  {
    id: 11,
    name: "Newton, Novena, Thomson",
    region: "Central",
    center: { lat: 1.3174, lng: 103.8384 },
    boundaries: districtBoundaries[11] as Coordinate[],
    summary: {
      property_count: 165,
      avg_price: 5800,
      property_types: {
        Condo: 115,
        HDB: 25,
        Landed: 25
      },
      price_range: {
        min: 4000,
        max: 11000
      },
      avg_size: 1200
    }
  },
  {
    id: 12,
    name: "Balestier, Toa Payoh, Serangoon",
    region: "Central",
    center: { lat: 1.3300, lng: 103.8500 },
    boundaries: districtBoundaries[12] as Coordinate[],
    summary: {
      property_count: 185,
      avg_price: 4200,
      property_types: {
        Condo: 85,
        HDB: 85,
        Landed: 15
      },
      price_range: {
        min: 2800,
        max: 7500
      },
      avg_size: 950
    }
  },
  {
    id: 13,
    name: "Macpherson, Braddell",
    region: "Central",
    center: { lat: 1.3400, lng: 103.8700 },
    boundaries: districtBoundaries[13] as Coordinate[],
    summary: {
      property_count: 155,
      avg_price: 3900,
      property_types: {
        Condo: 65,
        HDB: 80,
        Landed: 10
      },
      price_range: {
        min: 2600,
        max: 6800
      },
      avg_size: 920
    }
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