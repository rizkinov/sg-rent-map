import fs from 'fs'
import path from 'path'
import { Property } from '@/types/property'
import { districtData } from '@/data/districts/singapore-districts'

// Read the property data JSON file
const propertyData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'src/data/properties.json'),
    'utf-8'
  )
) as Property[]

// Process districts
const districtSummaries = districtData.map(district => {
  // Find properties in this district
  const districtProperties = propertyData.filter(property => {
    const latDiff = Math.abs(district.center.lat - property.latitude)
    const lngDiff = Math.abs(district.center.lng - property.longitude)
    return latDiff < 0.02 && lngDiff < 0.02
  })

  // Calculate statistics
  const avgRent = districtProperties.length
    ? Math.round(
        districtProperties.reduce((sum, p) => sum + p.rental_price, 0) / 
        districtProperties.length
      )
    : 0

  // Get min and max rent
  const minRent = districtProperties.length
    ? Math.min(...districtProperties.map(p => p.rental_price))
    : 0
  const maxRent = districtProperties.length
    ? Math.max(...districtProperties.map(p => p.rental_price))
    : 0

  // Get property type counts
  const propertyTypes = {
    Condo: districtProperties.filter(p => p.property_type === 'Condo').length,
    HDB: districtProperties.filter(p => p.property_type === 'HDB').length,
    Landed: districtProperties.filter(p => p.property_type === 'Landed').length,
  }

  // Get top 3 most common property names with their rental prices
  const propertyNameCounts = districtProperties.reduce((acc, property) => {
    if (!acc[property.property_name]) {
      acc[property.property_name] = {
        count: 0,
        minRent: property.rental_price,
        maxRent: property.rental_price,
        type: property.property_type
      }
    }
    acc[property.property_name].count++
    acc[property.property_name].minRent = Math.min(acc[property.property_name].minRent, property.rental_price)
    acc[property.property_name].maxRent = Math.max(acc[property.property_name].maxRent, property.rental_price)
    return acc
  }, {} as Record<string, { count: number; minRent: number; maxRent: number; type: string }>)

  const top3Properties = Object.entries(propertyNameCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 3)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      minRent: stats.minRent,
      maxRent: stats.maxRent,
      type: stats.type
    }))

  return {
    id: district.id,
    name: district.name,
    region: district.region,
    center_lat: district.center.lat,
    center_lng: district.center.lng,
    property_count: districtProperties.length,
    avg_price: avgRent,
    min_rent: minRent,
    max_rent: maxRent,
    condo_count: propertyTypes.Condo,
    hdb_count: propertyTypes.HDB,
    landed_count: propertyTypes.Landed,
    avg_size: Math.round(
      districtProperties.reduce((sum, p) => sum + p.sqft, 0) / 
      districtProperties.length || 0
    ),
    top_properties: top3Properties
  }
})

// Generate SQL insert statements
const sqlStatements = districtSummaries
  .map(district => `
    INSERT INTO districts (
      id, name, region, center_lat, center_lng,
      property_count, avg_price, min_rent, max_rent,
      condo_count, hdb_count, landed_count,
      avg_size, top_properties
    ) VALUES (
      ${district.id},
      '${district.name.replace(/'/g, "''")}',
      '${district.region}',
      ${district.center_lat},
      ${district.center_lng},
      ${district.property_count},
      ${district.avg_price},
      ${district.min_rent},
      ${district.max_rent},
      ${district.condo_count},
      ${district.hdb_count},
      ${district.landed_count},
      ${district.avg_size},
      ARRAY[${district.top_properties.map(p => 
        `'${JSON.stringify({
          name: p.name.replace(/'/g, "''"),
          count: p.count,
          minRent: p.minRent,
          maxRent: p.maxRent,
          type: p.type
        }).replace(/'/g, "''")}'`
      ).join(', ')}]
    );
  `)
  .join('\n')

// Save SQL file
fs.writeFileSync(
  path.join(process.cwd(), 'supabase/migrations/003_insert_district_data.sql'),
  sqlStatements
)

// Also save processed data as JSON for reference
fs.writeFileSync(
  path.join(process.cwd(), 'src/data/processed-districts.json'),
  JSON.stringify(districtSummaries, null, 2)
) 