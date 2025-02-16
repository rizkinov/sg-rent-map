import { districtData } from './singapore-districts'

// Ray casting algorithm for point in polygon
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }

  return inside
}

export function isPointInDistrict(lat: number, lng: number, districtId: number): boolean {
  const district = districtData.find(d => d.id === districtId)
  if (!district) return false

  return isPointInPolygon([lat, lng], district.boundaries)
}

export const districtBoundaries = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Raffles Place, Marina, Cecil",
        district_id: 1,
        region: "Central"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [103.8511, 1.2830], // Center
          [103.8461, 1.2880], // NW
          [103.8561, 1.2880], // NE
          [103.8561, 1.2780], // SE
          [103.8461, 1.2780], // SW
          [103.8511, 1.2830]  // Back to center
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Tanjong Pagar, Chinatown",
        district_id: 2,
        region: "Central"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [103.8446, 1.2764],
          [103.8396, 1.2814],
          [103.8496, 1.2814],
          [103.8496, 1.2714],
          [103.8396, 1.2714],
          [103.8446, 1.2764]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Tiong Bahru, Alexandra, Queenstown",
        district_id: 3,
        region: "Central"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [103.8320, 1.2878],
          [103.8270, 1.2928],
          [103.8370, 1.2928],
          [103.8370, 1.2828],
          [103.8270, 1.2828],
          [103.8320, 1.2878]
        ]]
      }
    },
    // Add more districts with their boundaries...
    {
      type: "Feature",
      properties: {
        name: "Tampines, Pasir Ris",
        district_id: 18,
        region: "East"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [103.9440, 1.3530],
          [103.9390, 1.3580],
          [103.9490, 1.3580],
          [103.9490, 1.3480],
          [103.9390, 1.3480],
          [103.9440, 1.3530]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Serangoon, Hougang, Punggol",
        district_id: 19,
        region: "North-East"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [103.8930, 1.3730],
          [103.8880, 1.3780],
          [103.8980, 1.3780],
          [103.8980, 1.3680],
          [103.8880, 1.3680],
          [103.8930, 1.3730]
        ]]
      }
    }
  ]
}; 